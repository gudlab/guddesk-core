#!/usr/bin/env bash
# Mirror cavewebs/flowchat (this tree) onto gudlab/guddesk-core without copying secrets.
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
python3 - "$ROOT" "$WORKDIR/guddesk-core" << 'PY'
import os, shutil, sys
from pathlib import Path
src, dst = Path(sys.argv[1]), Path(sys.argv[2])
exclude_dirs = {".git", ".next", "node_modules", ".contentlayer", ".vercel", ".impeccable"}
exclude_files = {
    "docs/gudbot-v1.md",
    "vercel.md",
    "PRODUCT.md",
    "DESIGN.md",
    ".github/workflows/cron.yml",
    "lib/scheduled/cron-workflow.test.ts",
}
src_files = set()
for dirpath, dirnames, filenames in os.walk(src):
    dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
    rel = Path(dirpath).relative_to(src)
    for f in filenames:
        relf = str(rel / f) if rel != Path(".") else f
        if relf in exclude_files or f.endswith(".pem") or f == ".DS_Store":
            continue
        if f.startswith(".env") and f != ".env.example":
            continue
        src_files.add(relf)
        target = dst / relf
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src / relf, target)
for dirpath, dirnames, filenames in os.walk(dst):
    dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
    rel = Path(dirpath).relative_to(dst)
    for f in filenames:
        relf = str(rel / f) if rel != Path(".") else f
        if relf.startswith(".git"):
            continue
        if relf not in src_files:
            (dst / relf).unlink()
PY

rm -f "$WORKDIR/guddesk-core/.env" \
  "$WORKDIR/guddesk-core/.env.local" \
  "$WORKDIR/guddesk-core/.env.loc" \
  "$WORKDIR/guddesk-core/.env.production" \
  "$WORKDIR/guddesk-core/docs/gudbot-v1.md" \
  "$WORKDIR/guddesk-core/vercel.md" \
  "$WORKDIR/guddesk-core/PRODUCT.md" \
  "$WORKDIR/guddesk-core/DESIGN.md" \
  "$WORKDIR/guddesk-core/.github/workflows/cron.yml" \
  "$WORKDIR/guddesk-core/lib/scheduled/cron-workflow.test.ts"
rm -rf "$WORKDIR/guddesk-core/.impeccable"

# Public README: this tree is gudlab/guddesk-core, not the private SaaS copy.
python3 - "$WORKDIR/guddesk-core/README.md" << 'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
text = p.read_text()
old = (
    "If you landed on `cavewebs/flowchat`, this is the **GudDesk** hosted SaaS working copy "
    "(`package.json` name `guddesk`). Star, clone, and open issues on **[gudlab/guddesk-core](https://github.com/gudlab/guddesk-core)**."
)
new = (
    "Star this repo if GudDesk is useful. Hosted cloud is [guddesk.com](https://guddesk.com). "
    "This is the public **AGPL-3.0** core (`package.json` name `guddesk`)."
)
if old not in text:
    raise SystemExit("error: public README overlay did not find the private landing paragraph")
p.write_text(text.replace(old, new, 1))
PY

# Self-host / public edition: no hosted plan caps.
cat > "$WORKDIR/guddesk-core/lib/feature-flags.ts" << 'EOF'
/**
 * Feature flags for GudDesk Core (public AGPL edition).
 * Self-host is uncapped. Cloud Free / Pro $29 / Business ~$99 live on guddesk.com.
 */

export type PlanLimits = {
  maxSeats: number;
  maxConversationsPerMonth: number;
  maxWorkspaces: number;
  aiEnabled: boolean;
  removeBranding: boolean;
};

const UNLIMITED: PlanLimits = {
  maxSeats: Infinity,
  maxConversationsPerMonth: Infinity,
  maxWorkspaces: Infinity,
  aiEnabled: true,
  removeBranding: true,
};

export function getPlanLimits(_plan?: string): PlanLimits {
  return UNLIMITED;
}

export type SeatDecision = {
  allowed: boolean;
  plan: string;
  members: number;
  pendingInvites: number;
  used: number;
  maxSeats: number;
};

export type ConversationBanner = {
  level: "warning" | "over";
  count: number;
  limit: number;
  monthKey: string;
};

export async function checkSeatAvailability(
  _workspaceId: string,
): Promise<SeatDecision> {
  return {
    allowed: true,
    plan: "CORE",
    members: 0,
    pendingInvites: 0,
    used: 0,
    maxSeats: Infinity,
  };
}

export async function getConversationLimitBanner(
  _workspaceId: string,
): Promise<ConversationBanner | null> {
  return null;
}

export async function canUserCreateWorkspace(_userId: string): Promise<{
  allowed: boolean;
  currentCount: number;
  maxAllowed: number;
}> {
  return { allowed: true, currentCount: 0, maxAllowed: Infinity };
}

export async function checkWorkspaceLimits(_workspaceId: string): Promise<{
  plan: string;
  limits: PlanLimits;
  currentSeats: number;
  currentMonthConversations: number;
  canAddSeat: boolean;
  canCreateConversation: boolean;
}> {
  return {
    plan: "CORE",
    limits: UNLIMITED,
    currentSeats: 0,
    currentMonthConversations: 0,
    canAddSeat: true,
    canCreateConversation: true,
  };
}
EOF

# Keep public funding file if this private tree has none.
if [[ ! -f "$WORKDIR/guddesk-core/.github/FUNDING.yml" ]]; then
  mkdir -p "$WORKDIR/guddesk-core/.github"
fi

cd "$WORKDIR/guddesk-core"

if [[ -e .env.loc || -e .env || -e .env.local ]]; then
  echo "error: secret env file survived the copy; refusing to continue." >&2
  exit 1
fi

if grep -R -E --exclude-dir='.git' --exclude-dir='node_modules' --exclude='*.example' --exclude='sync-oss.sh' \
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
Self-host plan limits stay uncapped. See CONTRIBUTING.md."

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
