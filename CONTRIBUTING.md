# Contributing to GudDesk

The public source repo is [gudlab/guddesk-core](https://github.com/gudlab/guddesk-core). Star that repo, open issues there, and send OSS PRs there.

`cavewebs/flowchat` is the private SaaS working copy that ships [guddesk.com](https://guddesk.com). The GitHub repo name is historical; the product is **GudDesk** (npm `guddesk`).

## Before you start

1. Open an issue for anything larger than a typo.
2. Keep PRs focused.
3. Do not add per-seat pricing. Cloud stays Free / Pro **$29/mo** / Business **~$99/mo**.
4. Do not ship GudBot v1, WhatsApp, or SSO in this quarter.

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm prisma generate
pnpm prisma db push
pnpm run build:widget
pnpm dev
```

Never commit `.env`, `.env.local`, or API keys.

## Checks

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build:widget
```

Self-host is uncapped. Hosted guddesk.com sets `GUDDESK_HOSTED=true` (see `.env.example` and `lib/feature-flags.ts`) to enforce Free / Pro limits.

## Publishing private → `gudlab/guddesk-core`

Private `cavewebs/flowchat` and public `gudlab/guddesk-core` do **not** share commit SHAs. After a SaaS change lands on `main`, the public edition is a **tree sync**. Do not push this `main` onto public `main`.

From a clean `main` on `cavewebs/flowchat`:

```bash
./scripts/sync-oss.sh
./scripts/sync-oss.sh --push
```

The script copies the tree, drops secrets (`.env*`, `*.pem`), and opens a `sync/YYYYMMDD` branch. Plan limits live in `lib/feature-flags.ts` and stay uncapped unless `GUDDESK_HOSTED=true`.

After the public PR merges, set GitHub metadata if it drifted:

```bash
gh api -X PATCH repos/gudlab/guddesk-core \
  -f homepage='https://guddesk.com' \
  -f description='Open-source live chat, inbox, knowledge base, and AI support. Intercom alternative without per-seat pricing.'

gh api -X PUT repos/gudlab/guddesk-core/topics \
  -H 'Accept: application/vnd.github+json' \
  -f names[]='customer-support' \
  -f names[]='live-chat' \
  -f names[]='intercom-alternative' \
  -f names[]='helpdesk' \
  -f names[]='nextjs' \
  -f names[]='typescript' \
  -f names[]='self-hosted' \
  -f names[]='open-source' \
  -f names[]='widget' \
  -f names[]='agpl'

gh api -X PATCH repos/cavewebs/flowchat \
  -f name='flowchat' \
  -f homepage='https://guddesk.com' \
  -f description='GudDesk hosted SaaS (npm guddesk). Public source: gudlab/guddesk-core'
```

Renaming `cavewebs/flowchat` to `guddesk` is an owner action in GitHub settings; the homepage/description commands above are enough for humans to find GudDesk without a rename.

## License

Contributions are accepted under AGPL-3.0-only. See [LICENSE](LICENSE).
