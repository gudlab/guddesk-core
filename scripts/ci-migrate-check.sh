#!/usr/bin/env bash
# CI: the migrations must build, on an empty Postgres, exactly the database
# schema.prisma describes, and must upgrade an older database that has data.
#
# Needs DATABASE_ADMIN_URL (a superuser URL ending in /postgres) and psql.
# Creates throwaway databases on that server. Never point it at a real
# database.
set -euo pipefail

admin="${DATABASE_ADMIN_URL:?set DATABASE_ADMIN_URL}"
base="${admin%/*}"
migrations=prisma/migrations

psql_admin() { psql "$admin" -v ON_ERROR_STOP=1 -qAtc "$1"; }
for db in migrate_fresh migrate_upgrade; do
  psql_admin "DROP DATABASE IF EXISTS $db"
  psql_admin "CREATE DATABASE $db"
done

# NOT NULL, unique: "<table> <column> <unique index>"
check_not_null_unique() {
  local url="$1" table="$2" column="$3" index="$4" nullable
  nullable=$(psql "$url" -qAtc "SELECT is_nullable FROM information_schema.columns WHERE table_name = '$table' AND column_name = '$column'")
  [ "$nullable" = "NO" ] || { echo "FAIL: $table.$column missing or nullable (got '${nullable}')"; exit 1; }
  psql "$url" -qAtc "SELECT 1 FROM pg_indexes WHERE indexname = '$index'" | grep -q 1 \
    || { echo "FAIL: unique index $index missing"; exit 1; }
}
check_workspaces() {
  check_not_null_unique "$1" workspaces appId workspaces_appId_key
  # 0005 drops the orphan 0001_init column workspaces.apiKey and its index.
  local leftover
  leftover=$(psql "$1" -qAtc "SELECT count(*) FROM information_schema.columns WHERE table_name = 'workspaces' AND column_name = 'apiKey'")
  [ "$leftover" = "0" ] || { echo "FAIL: workspaces.apiKey still exists"; exit 1; }
  leftover=$(psql "$1" -qAtc "SELECT count(*) FROM pg_indexes WHERE indexname = 'workspaces_apiKey_key'")
  [ "$leftover" = "0" ] || { echo "FAIL: index workspaces_apiKey_key still exists"; exit 1; }
}

echo "== 1. migrate deploy on an empty database"
fresh="$base/migrate_fresh"
DATABASE_URL="$fresh" pnpm exec prisma migrate deploy
check_workspaces "$fresh"
echo "== 1b. a second deploy is a no-op"
DATABASE_URL="$fresh" pnpm exec prisma migrate deploy | tee /tmp/second-deploy.txt
grep -q "No pending migrations" /tmp/second-deploy.txt

echo "== 2. no drift: migrations match schema.prisma"
# The diff must be empty: not a single statement.
DATABASE_URL="$fresh" pnpm exec prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script > /tmp/drift.sql
if grep -vE '^\s*$|^--' /tmp/drift.sql; then
  echo "FAIL: the migrations don't match schema.prisma (statements above). Add a migration."
  exit 1
fi

echo "== 3. smoke: every model reads, and a workspace can be created"
DATABASE_URL="$fresh" pnpm exec tsx scripts/ci-migrate-smoke.ts

echo "== 4. upgrade a pre-appId database that has data"
upgrade="$base/migrate_upgrade"
for name in $(ls -1 "$migrations" | grep -E '^[0-9]' | sort); do
  case "$name" in 0004_*) break ;; esac
  psql "$upgrade" -v ON_ERROR_STOP=1 -q -f "$migrations/$name/migration.sql"
  DATABASE_URL="$upgrade" pnpm exec prisma migrate resolve --applied "$name" >/dev/null
done
# Rows as an older install has them (0001_init: apiKey NOT NULL, no appId).
psql "$upgrade" -v ON_ERROR_STOP=1 -qc \
  "INSERT INTO \"workspaces\" (\"id\", \"name\", \"slug\", \"apiKey\", \"updated_at\")
   SELECT 'ws_ci_' || g, 'CI ' || g, 'ci-' || g, 'key_ci_' || g, now() FROM generate_series(1, 3) AS g"
DATABASE_URL="$upgrade" pnpm exec prisma migrate deploy
check_workspaces "$upgrade"
distinct=$(psql "$upgrade" -qAtc 'SELECT count(DISTINCT "appId") FROM "workspaces" WHERE "appId" IS NOT NULL')
[ "$distinct" = "3" ] || { echo "FAIL: expected 3 distinct backfilled appIds, got $distinct"; exit 1; }
rows=$(psql "$upgrade" -qAtc 'SELECT count(*) FROM "workspaces"')
[ "$rows" = "3" ] || { echo "FAIL: expected the 3 existing workspaces to survive, got $rows"; exit 1; }
DATABASE_URL="$upgrade" pnpm exec tsx scripts/ci-migrate-smoke.ts

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  echo "Migrations build schema.prisma on an empty Postgres (empty migrate diff) and upgrade an older database." >> "$GITHUB_STEP_SUMMARY"
fi
echo "OK"
