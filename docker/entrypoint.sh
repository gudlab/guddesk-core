#!/bin/sh
# Start the Next.js standalone server. Migrations run in the compose
# `migrate` service before this container starts.
set -eu

missing=""
for name in AUTH_SECRET DATABASE_URL NEXT_PUBLIC_APP_URL GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET RESEND_API_KEY; do
  eval "value=\${$name:-}"
  if [ -z "$value" ]; then
    missing="$missing $name"
  fi
done

if [ -n "$missing" ]; then
  echo "Missing required env:$missing" >&2
  echo "Copy .env.example to .env and fill those values. See docs/self-host.md." >&2
  exit 1
fi

exec node server.js
