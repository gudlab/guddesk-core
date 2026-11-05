# syntax=docker/dockerfile:1
# Multi-stage production image for self-host. Compose runs `migrate` first,
# then this runner. Build with: docker compose up --build
#
# NEXT_PUBLIC_* values are compiled into the client bundle. Changing
# NEXT_PUBLIC_APP_URL after the image is built requires a rebuild.

FROM node:20.19-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@10.15.1 --activate

# ---------------------------------------------------------------------------
# migrate: Prisma CLI only. Applies prisma/migrations to an empty or existing
# Postgres. Does not run the app and does not generate secrets.
# ---------------------------------------------------------------------------
FROM node:20.19-bookworm-slim AS migrate
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*
# Pin to the same Prisma major/minor as package.json.
RUN npm install --omit=dev prisma@7.4.2
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY docker/migrate.sh /migrate.sh
RUN chmod +x /migrate.sh
ENTRYPOINT ["/migrate.sh"]

# ---------------------------------------------------------------------------
# deps: install workspace + widget packages (includes prisma generate)
# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/widget/package.json packages/widget/pnpm-lock.yaml packages/widget/
COPY prisma ./prisma
COPY prisma.config.ts ./
# Flatten node_modules so the runner can copy Prisma / pg packages.
RUN echo "node-linker=hoisted" > .npmrc \
  && pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# builder: Next.js standalone + widget + contentlayer
# ---------------------------------------------------------------------------
FROM deps AS builder
COPY . .
# env.mjs validates these at build time. They are not production secrets.
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV AUTH_SECRET=docker-build-only-not-a-production-secret
ENV GOOGLE_CLIENT_ID=docker-build-google-client-id
ENV GOOGLE_CLIENT_SECRET=docker-build-google-client-secret
ENV DATABASE_URL=postgresql://guddesk:guddesk@127.0.0.1:5432/guddesk
ENV RESEND_API_KEY=re_docker_build_placeholder
ENV DOCKER_BUILD=1
RUN pnpm build \
  && node docker/copy-runtime-modules.mjs /runtime-node_modules

# ---------------------------------------------------------------------------
# runner: lean Next.js standalone server
# ---------------------------------------------------------------------------
FROM node:20.19-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Merge Prisma / pg into the standalone node_modules (do not replace it).
COPY --from=builder /runtime-node_modules /tmp/runtime-node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/docker/entrypoint.sh /entrypoint.sh

RUN cp -a /tmp/runtime-node_modules/. ./node_modules/ \
  && rm -rf /tmp/runtime-node_modules \
  && chmod +x /entrypoint.sh \
  && chown -R nextjs:nodejs /app/node_modules /entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
