#!/usr/bin/env bash
# Mirror cavewebs/flowchat (this tree) onto gudlab/guddesk-core without copying secrets.
# Do not overwrite lib/feature-flags.ts: both editions share GUDDESK_HOSTED-gated limits.
#
# Usage:
#   ./scripts/sync-oss.sh           # write a local clone and show git status
#   ./scripts/sync-oss.sh --push    # create sync/YYYYMMDD on origin and push
#
# Histories are not shared. Never: git push public main:main from this repo.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PUSH=0
if [[ "${1:-}" == "--push" ]]; then
  PUSH=1
fi

if [[ -n "$(git status --porcelain 2>/dev/null || true)" ]] && [[ -d "$ROOT/.git" ]]; then
  echo "error: working tree is dirty. Commit or stash first." >&2
  exit 1
fi

BRANCH="sync/$(date -u +%Y%m%d)"
PUBLIC_REMOTE="${PUBLIC_REMOTE:-https://github.com/gudlab/guddesk-core.git}"
WORKDIR="$(mktemp -d)"
cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

echo "Cloning ${PUBLIC_REMOTE} …"
git clone --depth 1 "$PUBLIC_REMOTE" "$WORKDIR/guddesk-core"

echo "Copying tree (secrets excluded) …"
rsync -a --delete \
  --exclude '.git/' \
  --exclude '.next/' \
  --exclude 'node_modules/' \
  --exclude '.contentlayer/' \
  --exclude '.vercel/' \
  --exclude '.env' \
  --exclude '.env.*' \
  --exclude '*.pem' \
  --exclude '.DS_Store' \
  --exclude 'docs/gudbot-v1.md' \
  --exclude 'vercel.md' \
  "$ROOT/" "$WORKDIR/guddesk-core/"

rm -f "$WORKDIR/guddesk-core/.env" \
  "$WORKDIR/guddesk-core/.env.local" \
  "$WORKDIR/guddesk-core/.env.loc" \
  "$WORKDIR/guddesk-core/.env.production" \
  "$WORKDIR/guddesk-core/docs/gudbot-v1.md" \
  "$WORKDIR/guddesk-core/vercel.md"

# Keep public funding file if this private tree has none.
if [[ ! -f "$WORKDIR/guddesk-core/.github/FUNDING.yml" ]]; then
  mkdir -p "$WORKDIR/guddesk-core/.github"
fi

cd "$WORKDIR/guddesk-core"

if [[ -e .env.loc || -e .env || -e .env.local ]]; then
  echo "error: secret env file survived the copy; refusing to continue." >&2
  exit 1
fi

if grep -R -E --exclude-dir='.git' --exclude='*.example' \
  'sk_live_|sk_test_|re_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}' . >/dev/null 2>&1; then
  echo "error: possible API key in the public tree; refusing to continue." >&2
  exit 1
fi

git checkout -B "$BRANCH"
git add -A

if git diff --cached --quiet; then
  echo "Public tree already matches. Nothing to commit."
  exit 0
fi

SHA="unknown"
if [[ -d "$ROOT/.git" ]]; then
  SHA="$(git -C "$ROOT" rev-parse --short HEAD)"
fi
git commit -m "sync: from cavewebs/flowchat ${SHA}

Tree copy of the GudDesk SaaS repo. Secrets (.env*) are excluded.
Plan limits stay uncapped unless GUDDESK_HOSTED=true. See CONTRIBUTING.md."

echo
git status
echo
echo "Public branch: ${BRANCH}"

if [[ "$PUSH" -eq 1 ]]; then
  git push -u origin "$BRANCH"
  echo "Pushed. Open a PR: https://github.com/gudlab/guddesk-core/pull/new/${BRANCH}"
else
  echo "Dry run. Re-run with --push to publish the branch."
fi
