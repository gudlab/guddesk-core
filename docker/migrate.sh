#!/bin/sh
# Apply prisma/migrations. Retries while Postgres is still coming up.
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required for migrate." >&2
  exit 1
fi

i=0
while true; do
  if npx prisma migrate deploy; then
    exit 0
  fi
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "prisma migrate deploy failed after ${i} attempts." >&2
    exit 1
  fi
  echo "migrate: database not ready, retry ${i}/30..."
  sleep 2
done
