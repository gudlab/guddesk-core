#!/usr/bin/env bash
# CI: the migrations must apply to an empty Postgres, and the newest one
# must also upgrade a database that has data.
#
# Needs DATABASE_ADMIN_URL (a superuser URL ending in /postgres) and psql.
# Creates two throwaway databases on that server. Never point it at a real
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

check_app_id() {
  local url="$1"
  local column
  column=$(psql "$url" -qAtc "SELECT is_nullable FROM information_schema.columns WHERE table_name = 'workspaces' AND column_name = 'appId'")
  [ "$column" = "NO" ] || { echo "FAIL: workspaces.appId missing or nullable (got '${column}')"; exit 1; }
  psql "$url" -qAtc "SELECT 1 FROM pg_indexes WHERE indexname = 'workspaces_appId_key'" | grep -q 1 \
    || { echo "FAIL: unique index workspaces_appId_key missing"; exit 1; }
}

echo "== 1. migrate deploy on an empty database"
fresh="$base/migrate_fresh"
DATABASE_URL="$fresh" pnpm exec prisma migrate deploy
check_app_id "$fresh"
echo "== 1b. a second deploy is a no-op"
DATABASE_URL="$fresh" pnpm exec prisma migrate deploy | tee /tmp/second-deploy.txt
grep -q "No pending migrations" /tmp/second-deploy.txt

echo "== 2. the newest migration upgrades a database with data"
upgrade="$base/migrate_upgrade"
mapfile -t all < <(ls -1 "$migrations" | grep -E '^[0-9]' | sort)
newest="${all[-1]}"
for name in "${all[@]}"; do
  [ "$name" = "$newest" ] && continue
  psql "$upgrade" -v ON_ERROR_STOP=1 -q -f "$migrations/$name/migration.sql"
  DATABASE_URL="$upgrade" pnpm exec prisma migrate resolve --applied "$name" >/dev/null
done
# Rows as an older install has them (0001_init still has apiKey NOT NULL).
psql "$upgrade" -v ON_ERROR_STOP=1 -qc \
  "INSERT INTO \"workspaces\" (\"id\", \"name\", \"slug\", \"apiKey\", \"updated_at\")
   SELECT 'ws_ci_' || g, 'CI ' || g, 'ci-' || g, 'key_ci_' || g, now() FROM generate_series(1, 3) AS g"
DATABASE_URL="$upgrade" pnpm exec prisma migrate deploy
check_app_id "$upgrade"
distinct=$(psql "$upgrade" -qAtc 'SELECT count(DISTINCT "appId") FROM "workspaces" WHERE "appId" IS NOT NULL')
[ "$distinct" = "3" ] || { echo "FAIL: expected 3 distinct backfilled appIds, got $distinct"; exit 1; }

echo "== 3. drift report (informational)"
# The migrations folder is behind schema.prisma (self-host setup uses
# `prisma db push`). This prints what a migrations-built database still
# lacks; it does not fail the job.
DATABASE_URL="$fresh" pnpm exec prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script > /tmp/drift.sql || true
statements=$(grep -cE '^(CREATE|ALTER|DROP)' /tmp/drift.sql || true)
echo "Statements still needed to match schema.prisma: ${statements}"
grep -E '^(CREATE TABLE|ALTER TABLE|DROP)' /tmp/drift.sql | cut -c1-100 || true
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  echo "Migrations apply cleanly. Drift vs schema.prisma: ${statements} statements (see the job log)." >> "$GITHUB_STEP_SUMMARY"
fi
echo "OK"
