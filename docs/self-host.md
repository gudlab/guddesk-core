# Self-host GudDesk

Run GudDesk on your own machine with Docker Compose, or from source. The public license is AGPL-3.0. GudBot stays off until you turn it on in workspace settings.

`.env.example` is the list of environment variables. Copy it. Do not commit `.env` or any file that holds real secrets.

## Docker Compose (recommended)

### Prerequisites

- Docker Engine and Docker Compose v2
- A copy of this repo

You do not need Node.js on the host for Compose. The image uses Node 20.19.

### First run

```bash
git clone https://github.com/gudlab/guddesk-core.git
cd guddesk-core
cp .env.example .env
```

Edit `.env`:

| Variable | What to put |
|---|---|
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for a local trial. Your public URL in production, no trailing slash |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Real Google OAuth values to sign in with Google. Placeholders such as `compose-unused` start the server |
| `RESEND_API_KEY` | Real Resend key to send mail. A placeholder such as `re_unused` starts the server; outbound email stays off until you set a real key and `RESEND_FROM` |
| `DATABASE_URL` | Leave the example value. Compose points the app at the Postgres service |

Then:

```bash
docker compose up --build
```

Compose will:

1. Start Postgres 16 and keep data in the `guddesk-postgres` named volume
2. Run `prisma migrate deploy` (creates tables on first boot)
3. Start the app on [http://localhost:3000](http://localhost:3000)

The chat widget is built during the image build and served at `/widget.js`.

Stop with `Ctrl+C` or `docker compose down`. The volume keeps the database. `docker compose down -v` deletes it.

### Sign-in

The server boots with placeholder Google and Resend values. To create an account:

- Set real Google OAuth credentials and use **Continue with Google**, or
- Register with email and password on `/register`. Magic-link email needs a real `RESEND_API_KEY` and `RESEND_FROM` on a domain you verified in Resend

### Production notes

- Put the app behind TLS (Caddy, Nginx, or Traefik)
- Set `NEXT_PUBLIC_APP_URL` to `https://support.yourdomain.com` and **rebuild** the app image. `NEXT_PUBLIC_*` values are compiled in at build time
- Change `POSTGRES_PASSWORD` (compose default is `guddesk`, for local use)
- Generate `AUTH_SECRET` on the host. Do not reuse the Docker build placeholder
- Set `RESEND_FROM` to a sender on your domain if you send mail
- Leave Pusher, Stripe, and Anthropic empty until you need them. Without Pusher, the inbox and widget poll
- GudBot stays off until you enable it and set `ANTHROPIC_API_KEY`
- Schedule `/api/cron/*` yourself. The routes and suggested timings are in [content/docs/self-hosting.mdx](../content/docs/self-hosting.mdx)

### Common pitfalls

- **Node 20.19+** if you build from source. 20.18 throws `ERR_REQUIRE_ESM` on `prisma generate`
- **Empty `AUTH_SECRET`** — the container exits and prints the missing names
- **`DATABASE_URL` on the host** — Compose overrides it for `app` and `migrate`. Pointing `.env` at Neon does not change the Compose database
- **Resend** — optional for a local trial. `env.mjs` still requires the variable to be non-empty. Outbound mail needs a real key
- **Widget / public URL** — after you change `NEXT_PUBLIC_APP_URL` or Pusher public keys, rebuild: `docker compose up --build`
- **Port 5432 already in use** — set `POSTGRES_PORT=5433` in `.env` or stop the other Postgres

### Updating

```bash
git pull origin main
docker compose up --build
```

`migrate` applies new migrations on startup. Read the release notes before you pull.

## From source

### Prerequisites

- Node.js 20.19 or later
- pnpm
- PostgreSQL 15+ (local or hosted)

```bash
pnpm install
cp .env.example .env.local
# Fill DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_APP_URL,
# GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, RESEND_API_KEY
pnpm prisma generate
pnpm prisma db push
pnpm run build:widget
pnpm build
pnpm start
```

For day-to-day development use `pnpm prisma db push` and `pnpm dev`. For a production-like process use `pnpm prisma migrate deploy` then `pnpm build` and `pnpm start`.

Open [http://localhost:3000](http://localhost:3000).

## Performance budgets

These are engineering targets, not hosted SLOs.

| Surface | Budget | How to measure |
|---|---|---|
| Chat widget (`public/widget.js`) | ≤ 50 KB gzipped | `pnpm run build:widget` (fails CI if over). Or `node scripts/check-widget-bundle.mjs` |
| Agent inbox list `GET /api/inbox/conversations` | p95 < 300 ms | `pnpm measure:inbox` against a running app or local/compose Postgres |

`pnpm measure:inbox` prints the numbers it just collected. It does not claim a production p95.

See [docs/performance.md](performance.md).
