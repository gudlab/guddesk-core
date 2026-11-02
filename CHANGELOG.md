# Changelog

All notable changes to GudDesk core are listed here. The format follows Keep a Changelog, and versions follow Semantic Versioning.

## [0.1.0] - 2026-11-02

First tagged release. Everything before this lived only on main.

### Added
- Live chat widget with one-tag install (`data-app-id`) and page visibility rules (include or exclude by path) (#1, #14)
- HMAC identity checks for logged-in widget users (#12)
- Shared inbox for chat and email, with assignment, tags and internal notes
- Inbound email: replies by email land in the conversation, and the Resend webhook signature is verified (#50, #52)
- Help center with collections and a publish workflow
- Automation rules that run, with loop guards, idempotent runs and a 5-minute scheduler (#47)
- SLA checks in business hours, with an IANA time zone picker (#35, #46)
- Agent API: your own bot gets a webhook and an API key, and replies as BOT
- Server-side dedupe of agent replies with an idempotency key (#53)
- Agent availability selector in the inbox (#41)
- Test harness and CI that runs typecheck, lint, build and tests on every PR (#10, #13)

### Changed
- Live updates use Pusher when keys are set. Without them, the inbox and widget poll (every 4 seconds in an open thread and the widget, every 10 seconds in the list) (#34, #36, #39)
- Account emails match case-insensitively, and new ones are stored lowercase (#55)
- Pending invites say "Expires in 7 days" (#59)
- Site copy now matches what ships. AI assist is marked as planned for GudBot v1 (#17, #37, #44)
- Prisma 7.4.2 (#38)

### Fixed
- The widget no longer creates a visitor on every page view (#43)
- The first "replying" signal is no longer dropped when a conversation opens (#42)
- The inbox shows an error state instead of crashing when the connection drops (#57)
- Widget CORS preflight on hosted guddesk.com (#11)
- The SLA weekday is read in the workspace time zone (#18)
- Migrations catch up to schema.prisma, and CI fails on any drift (#56, #58)

### Security
- Widget visitors are never merged by externalId without a valid HMAC (#12)
- Security headers on, and x-powered-by hidden (#30)
- API key permission levels are enforced on MCP tools (#24, #26, #32)
- SKIP_ENV_VALIDATION is ignored in production (#27)

### Not in this release
- AI reply suggestions and summaries (planned, GudBot v1)
- A built-in AI agent
- Docker or compose files. Self-host runs from source on Node.js 20.19+ with PostgreSQL
- WhatsApp, SSO and mobile apps
