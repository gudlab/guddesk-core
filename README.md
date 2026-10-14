<p align="center">
  <a href="https://www.guddesk.com">
    <img src="docs/assets/guddesk-hero.svg" alt="GudDesk homepage" width="800" />
  </a>
</p>

<p align="center">
  <a href="https://www.guddesk.com">
    <img src="docs/assets/guddesk-tour.svg" alt="GudDesk product tour" width="800" />
  </a>
</p>

<p align="center">
  <a href="https://www.guddesk.com">Watch the full reel on guddesk.com</a>
</p>

<p align="center">
  <strong>GudDesk</strong> — open-source customer messaging for humans and agents.<br />
  Live chat, shared inbox, knowledge base, AI-powered support, and automations.
</p>

<p align="center">
  <a href="https://guddesk.com">Website</a> ·
  <a href="https://guddesk.com/docs">Documentation</a> ·
  <a href="https://github.com/gudlab/guddesk-core">Public source</a> ·
  <a href="https://gudlab.org">GudLab</a>
</p>

Star this repo if GudDesk is useful. Hosted cloud is [guddesk.com](https://guddesk.com). This is the public **AGPL-3.0** core (`package.json` name `guddesk`).

---

## About

GudDesk is an Intercom / Zendesk alternative without per-seat pricing. Self-host the AGPL core, or use cloud:

| Cloud plan | Price | Notes |
|---|---|---|
| Free | $0 | 2 members, 500 conversations/month |
| Pro | **$29/mo** flat | Unlimited seats, built-in AI, branding off |
| Business | **~$99/mo** flat | Same no-per-seat rule; talk to us to enable |

Self-host is uncapped. WhatsApp, SSO, and GudBot v1 are **not** in this release.

Built by [GudLab](https://gudlab.org).

### Key Features

- **Live Chat Widget** — two-line snippet via `cdn.guddesk.com`
- **Shared Inbox** — assignment, tagging, real-time via Pusher
- **Knowledge Base** — collections, publish workflow, public help center
- **AI-Powered Support** — reply suggestions, summaries (Claude; Pro cloud)
- **AI Agent Plugins** — external bots via REST + webhooks (`BOT` messages)
- **Automations** — rules on conversation events
- **Self-Hosted** — your Postgres, your keys

## Install the widget (hosted)

```html
<script>window.GudDeskSettings={appId:"gd_pub_xxxxxxxxxxxxxxxx"}</script>
<script src="https://cdn.guddesk.com/widget.js" async></script>
```

Use a `gd_pub_` app ID from **Workspace → Settings → Widget**. Never put server API keys (`gd_live_`, `gd_test_`, Stripe, Anthropic, Pusher secrets) in the snippet or in git.

Self-host: keep the same `appId` and load `https://your-domain/widget.js` instead of the CDN.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | [TypeScript](https://typescriptlang.org) |
| Database | [PostgreSQL](https://postgresql.org) via [Prisma 7](https://prisma.io) |
| Auth | [Auth.js v5](https://authjs.dev) |
| Real-time | [Pusher](https://pusher.com) |
| AI | [Anthropic Claude](https://anthropic.com) |
| Email | [Resend](https://resend.com) + [React Email](https://react.email) |
| UI | [Tailwind CSS](https://tailwindcss.com), [Radix UI](https://radix-ui.com), [shadcn/ui](https://ui.shadcn.com) |
| Widget | [Preact](https://preactjs.com) + [Vite](https://vitejs.dev) (Shadow DOM) |

## Getting Started

### Prerequisites

- **Node.js 20+**
- **pnpm**
- **PostgreSQL** (e.g. [Neon](https://neon.tech) or local)

### 1. Clone and install

```bash
git clone https://github.com/gudlab/guddesk-core.git
cd guddesk-core
pnpm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

Fill `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, and Google OAuth. Leave Pusher / Stripe / Anthropic empty until you need them. Leave `GUDDESK_HOSTED` unset so self-host stays uncapped; hosted guddesk.com sets `GUDDESK_HOSTED=true`. **Do not commit `.env*` files.**

### 3. Database + widget + dev

```bash
pnpm prisma generate
pnpm prisma db push
pnpm run build:widget
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## License

GudDesk is licensed under the [GNU Affero General Public License v3.0](LICENSE) (`AGPL-3.0-only`). The `LICENSE` file and this README agree on that.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). OSS PRs and stars go to [gudlab/guddesk-core](https://github.com/gudlab/guddesk-core).
