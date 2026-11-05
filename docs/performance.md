# Performance budgets

Targets for this repo. Numbers below are only valid if you measured them on the machine you name.

GudBot stays default off. These checks do not enable it.

## Widget: 50 KB gzipped

`public/widget.js` is the file customer sites load with a `<script>` tag.

- Budget: **50 × 1024 bytes** after `zlib.gzipSync` (Node default level 6)
- Enforced by `scripts/check-widget-bundle.mjs` during `pnpm run build:widget` and `pnpm build`
- The same script still rejects bare `import("pusher-js")` / `require("…")` specifiers

```bash
pnpm run build:widget
```

On success it prints the gzip size. CI fails if the file is over budget.

The embed API stays the same: `window.GudDeskSettings`, `GudDesk.identify()` with HMAC `userHash`, page rules, polling, and optional Pusher.

## Inbox list: p95 under 300 ms

Budget applies to **`GET /api/inbox/conversations`** (the agent inbox list and its 10-second poll when Pusher is off).

The route loads one page (default 25) of conversations for a workspace, with visitor fields only. It does not load message bodies.

### Measure the HTTP path (needs a signed-in cookie)

1. Run the app (`pnpm dev` or `docker compose up`)
2. Sign in and open the inbox
3. Copy the session cookie for localhost from the browser
4. Copy the workspace id (the `workspaceId` query param on `/api/inbox/conversations`)

```bash
INBOX_MEASURE_BASE=http://localhost:3000 \
INBOX_MEASURE_WORKSPACE_ID=your_workspace_id \
INBOX_MEASURE_COOKIE='authjs.session-token=...' \
pnpm measure:inbox
```

The script runs a warmup request, then 20 timed GETs, and prints min / p50 / p95 / max. It fails if p95 is ≥ 300 ms unless you pass `--no-fail`.

A 401 means the cookie is missing or stale. That is not an inbox-list measurement.

### Measure the query only (local / Compose Postgres)

This times the same Prisma `findMany` + `count` the route uses, without HTTP or auth. Use it when you have `DATABASE_URL` and a workspace id but no session cookie.

```bash
# Compose publishes Postgres on localhost:5432 by default
DATABASE_URL=postgresql://guddesk:guddesk@localhost:5432/guddesk \
INBOX_MEASURE_WORKSPACE_ID=your_workspace_id \
pnpm measure:inbox --query
```

On an empty database the query is a few milliseconds. That does not prove a loaded inbox stays under 300 ms. Load conversations (or use a copy of real data) before you treat the number as a budget check.

Sample from this change, Compose Postgres on the agent VM, 30 OPEN conversations, `--query` mode, 20 runs: **p95 4.9 ms** (min 1.1, p50 2.0, max 5.8). That is the Prisma list query only, not the HTTP+auth path, and not a production p95.

### What the list query hits

Existing indexes on `conversations`:

- `(workspaceId, status)`
- `(workspaceId, assigneeId)`
- `(workspaceId, lastMessageAt)`

The list select is the inbox row fields plus the visitor. It does not include message counts or unused conversation columns.
