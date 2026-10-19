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

## Preview QA seed

QA authenticated tests need two workspaces on a **dedicated Preview database**, not production. Preview may receive XSS test payloads. Never point the seed at production data.

1. Create a separate Preview Postgres database (Neon branch or a distinct `PREVIEW_DATABASE_URL`). Do not reuse the production database.
2. In the Vercel project, set Preview-only env vars listed in `.env.example` under "Preview QA seed", plus Preview `DATABASE_URL` (same dedicated database), Stripe **test** keys, `AUTH_SECRET`, and the other boot vars in that file. Do not copy Production Stripe live keys onto Preview.
3. Apply schema, then seed from a machine that can reach that database:

```bash
export PREVIEW_DATABASE_URL='postgresql://…preview…'   # preferred over DATABASE_URL
export PREVIEW_SEED=1
export PREVIEW_OWNER_A_PASSWORD=        # from your secret store
export PREVIEW_OWNER_B_PASSWORD=
export PREVIEW_AGENT_A_PASSWORD=
export PREVIEW_AGENT_B_PASSWORD=
export PREVIEW_WORKSPACE_A_IDENTITY_SECRET=
export STRIPE_SECRET_KEY=sk_test_…      # refused if sk_live_ / rk_live_
pnpm prisma generate
DATABASE_URL="$PREVIEW_DATABASE_URL" pnpm prisma db push
pnpm db:seed:preview
```

If `PRODUCTION_DATABASE_URL` or `PROD_DATABASE_URL` is set and matches the URL in use, the script exits.

Default logins (passwords are the env values, never committed):

| Email | Role | Workspace |
|---|---|---|
| `qa-owner-a@guddesk.test` | OWNER | `preview-a` (HMAC identity secret set) |
| `qa-agent-a@guddesk.test` | AGENT | `preview-a` |
| `qa-owner-b@guddesk.test` | OWNER | `preview-b` (HMAC identity secret unset) |
| `qa-agent-b@guddesk.test` | AGENT | `preview-b` |

Each workspace also gets the `getting-started` collection (3 published articles) and two sample conversations (one open, one closed). Re-running upserts users and articles; existing conversation threads are left in place so XSS payloads QA added are not wiped.

The script refuses `VERCEL_ENV=production` and live Stripe keys. It does not create Stripe customers; first checkout on Preview does that in test mode.

Manual infra still needed: Preview `DATABASE_URL`, Stripe test webhook endpoint for the Preview URL if you test billing webhooks, Google OAuth redirect URIs for the Preview hostname if you test Google login, and Auth.js `AUTH_SECRET` on Preview.

## Checks

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm run build:widget
```

`pnpm test` globs `**/*.test.ts` explicitly (Node 20 `tsx --test` with no files matches nothing) and fails if the TAP count is 0. Each test has a 10s timeout.

## Publishing private → `gudlab/guddesk-core`

Private `cavewebs/flowchat` and public `gudlab/guddesk-core` do **not** share commit SHAs. After a SaaS change lands on `main`, the public edition is a **tree sync**. Do not push this `main` onto public `main`.

From a clean `main` on `cavewebs/flowchat`:

```bash
./scripts/sync-oss.sh
./scripts/sync-oss.sh --push
```

The script copies the tree, drops secrets (`.env*`, `*.pem`), keeps self-host plan limits uncapped on the public copy, and opens a `sync/YYYYMMDD` branch.

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
