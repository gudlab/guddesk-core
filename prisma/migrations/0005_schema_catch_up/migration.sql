-- Catch-up, add-only: brings a database built with `prisma migrate deploy`
-- up to prisma/schema.prisma. Generated with
--   prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
-- against a throwaway Postgres that had 0001..0004 applied, then guarded so
-- every statement is a no-op when the object already exists:
--   enums and foreign keys: DO $$ ... EXCEPTION WHEN duplicate_object
--   tables, columns, indexes: IF NOT EXISTS
-- Nothing is dropped, renamed or retyped.
--
-- Only for fresh installs, or databases whose _prisma_migrations is empty
-- and that were built from migrations. A database made with `prisma db push`
-- should stay on `db push` (see the self-hosting docs).

-- CreateEnum ConversationChannel
DO $$ BEGIN
  CREATE TYPE "ConversationChannel" AS ENUM ('WIDGET', 'EMAIL', 'API');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum SurveyType
DO $$ BEGIN
  CREATE TYPE "SurveyType" AS ENUM ('CSAT', 'NPS');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum SurveyTriggerType
DO $$ BEGIN
  CREATE TYPE "SurveyTriggerType" AS ENUM ('ON_CLOSE', 'AFTER_DELAY');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum AgentAvailability
DO $$ BEGIN
  CREATE TYPE "AgentAvailability" AS ENUM ('ONLINE', 'AWAY', 'OFFLINE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum ApiKeyPermission
DO $$ BEGIN
  CREATE TYPE "ApiKeyPermission" AS ENUM ('READ_ONLY', 'READ_WRITE', 'FULL_ACCESS');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum AgentType
DO $$ BEGIN
  CREATE TYPE "AgentType" AS ENUM ('BUILT_IN', 'MARKETPLACE', 'CUSTOM');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum WebhookDeliveryStatus
DO $$ BEGIN
  CREATE TYPE "WebhookDeliveryStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum CustomFieldType
DO $$ BEGIN
  CREATE TYPE "CustomFieldType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'ENUM');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- workspaces.apiKey (from 0001_init; not in schema.prisma, so Prisma never
-- sends it). Kept NOT NULL and unique, as decided. A database default
-- generates it, so creating a workspace works on a migrations-built
-- database. Same shape as the appId backfill in 0004.
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "apiKey" TEXT;
ALTER TABLE "workspaces" ALTER COLUMN "apiKey" SET DEFAULT ('c' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 24));
UPDATE "workspaces"
SET "apiKey" = 'c' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 24)
WHERE "apiKey" IS NULL;
ALTER TABLE "workspaces" ALTER COLUMN "apiKey" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "workspaces_apiKey_key" ON "workspaces"("apiKey");

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "channel" "ConversationChannel" NOT NULL DEFAULT 'WIDGET',
ADD COLUMN IF NOT EXISTS "customFieldValues" JSONB,
ADD COLUMN IF NOT EXISTS "firstResponseAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "firstResponseDueAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "resolutionDueAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "slaBreachedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "slaPolicyId" TEXT,
ADD COLUMN IF NOT EXISTS "ticketFormId" TEXT;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "emailMessageId" TEXT,
ADD COLUMN IF NOT EXISTS "mentions" TEXT[];

-- AlterTable
ALTER TABLE "visitors" ADD COLUMN IF NOT EXISTS "companyId" TEXT;

-- AlterTable
ALTER TABLE "widget_settings" ADD COLUMN IF NOT EXISTS "identitySecret" TEXT,
ADD COLUMN IF NOT EXISTS "offline_form_timeout" INTEGER,
ADD COLUMN IF NOT EXISTS "pageVisibilityMode" TEXT NOT NULL DEFAULT 'exclude',
ADD COLUMN IF NOT EXISTS "pageVisibilityPatterns" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "workspace_members" ADD COLUMN IF NOT EXISTS "availability" "AgentAvailability" NOT NULL DEFAULT 'OFFLINE',
ADD COLUMN IF NOT EXISTS "currentViewingId" TEXT,
ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "agents" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "AgentType" NOT NULL DEFAULT 'CUSTOM',
    "iconUrl" TEXT,
    "creatorName" TEXT,
    "creatorUrl" TEXT,
    "webhookEndpointId" TEXT,
    "apiKeyId" TEXT,
    "config" JSONB,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "webhook_endpoints" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "onMessageCreated" BOOLEAN NOT NULL DEFAULT true,
    "onConversationCreated" BOOLEAN NOT NULL DEFAULT true,
    "onConversationClosed" BOOLEAN NOT NULL DEFAULT false,
    "onConversationAssigned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "webhook_deliveries" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" "WebhookDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 6,
    "nextRetryAt" TIMESTAMP(3),
    "httpStatus" INTEGER,
    "responseBody" TEXT,
    "errorMessage" TEXT,
    "durationMs" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "api_keys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "permission" "ApiKeyPermission" NOT NULL DEFAULT 'READ_WRITE',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "companies" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "industry" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "custom_fields" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "fieldType" "CustomFieldType" NOT NULL,
    "entityType" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "enumOptions" TEXT[],
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "customer_events" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "customer_segments" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "conditions" JSONB NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "sla_policies" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstResponseMinutes" INTEGER NOT NULL,
    "resolutionMinutes" INTEGER NOT NULL,
    "priority" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sla_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "business_hours" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "schedule" JSONB NOT NULL,
    "holidays" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ticket_forms" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fieldKeys" TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "survey_configs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "SurveyType" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "trigger" "SurveyTriggerType" NOT NULL DEFAULT 'ON_CLOSE',
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "questionText" TEXT NOT NULL DEFAULT 'How would you rate your experience?',
    "thankYouText" TEXT NOT NULL DEFAULT 'Thank you for your feedback!',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "survey_responses" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "conversationId" TEXT,
    "visitorId" TEXT NOT NULL,
    "type" "SurveyType" NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "assigneeId" TEXT,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "email_channel_configs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "supportAddress" TEXT,
    "forwardAddress" TEXT,
    "fromName" TEXT,
    "fromAddress" TEXT,
    "signature" TEXT,
    "autoReopen" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_channel_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "shared_drafts" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "lastEditedBy" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "side_conversations" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "participantIds" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "side_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "side_conversation_messages" (
    "id" TEXT NOT NULL,
    "sideConversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderName" TEXT,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "side_conversation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "agent_performance_snapshots" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "conversationsHandled" INTEGER NOT NULL DEFAULT 0,
    "messagesCount" INTEGER NOT NULL DEFAULT 0,
    "avgFirstResponseMs" INTEGER,
    "avgResolutionMs" INTEGER,
    "csatAverage" DOUBLE PRECISION,
    "csatCount" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_performance_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "agents_webhookEndpointId_key" ON "agents"("webhookEndpointId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "agents_apiKeyId_key" ON "agents"("apiKeyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "agents_workspaceId_isEnabled_idx" ON "agents"("workspaceId", "isEnabled");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "webhook_endpoints_workspaceId_idx" ON "webhook_endpoints"("workspaceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "webhook_deliveries_endpointId_created_at_idx" ON "webhook_deliveries"("endpointId", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "webhook_deliveries_status_nextRetryAt_idx" ON "webhook_deliveries"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "webhook_deliveries_endpointId_status_idx" ON "webhook_deliveries"("endpointId", "status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_keyHash_key" ON "api_keys"("keyHash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "api_keys_userId_idx" ON "api_keys"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "api_keys_workspaceId_idx" ON "api_keys"("workspaceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "companies_workspaceId_idx" ON "companies"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "companies_workspaceId_domain_key" ON "companies"("workspaceId", "domain");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "custom_fields_workspaceId_entityType_idx" ON "custom_fields"("workspaceId", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "custom_fields_workspaceId_key_entityType_key" ON "custom_fields"("workspaceId", "key", "entityType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "customer_events_visitorId_created_at_idx" ON "customer_events"("visitorId", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "customer_events_workspaceId_created_at_idx" ON "customer_events"("workspaceId", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "customer_segments_workspaceId_idx" ON "customer_segments"("workspaceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "sla_policies_workspaceId_idx" ON "sla_policies"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "sla_policies_workspaceId_priority_key" ON "sla_policies"("workspaceId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "business_hours_workspaceId_key" ON "business_hours"("workspaceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ticket_forms_workspaceId_idx" ON "ticket_forms"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "survey_configs_workspaceId_type_key" ON "survey_configs"("workspaceId", "type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "survey_responses_workspaceId_type_respondedAt_idx" ON "survey_responses"("workspaceId", "type", "respondedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "survey_responses_workspaceId_assigneeId_respondedAt_idx" ON "survey_responses"("workspaceId", "assigneeId", "respondedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "survey_responses_conversationId_idx" ON "survey_responses"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "email_channel_configs_workspaceId_key" ON "email_channel_configs"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "shared_drafts_conversationId_key" ON "shared_drafts"("conversationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "side_conversations_conversationId_idx" ON "side_conversations"("conversationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "side_conversations_workspaceId_idx" ON "side_conversations"("workspaceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "side_conversation_messages_sideConversationId_created_at_idx" ON "side_conversation_messages"("sideConversationId", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "agent_performance_snapshots_workspaceId_date_idx" ON "agent_performance_snapshots"("workspaceId", "date");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "agent_performance_snapshots_memberId_date_key" ON "agent_performance_snapshots"("memberId", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "conversations_workspaceId_channel_idx" ON "conversations"("workspaceId", "channel");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "visitors_companyId_idx" ON "visitors"("companyId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "visitors" ADD CONSTRAINT "visitors_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_slaPolicyId_fkey" FOREIGN KEY ("slaPolicyId") REFERENCES "sla_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_ticketFormId_fkey" FOREIGN KEY ("ticketFormId") REFERENCES "ticket_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "agents" ADD CONSTRAINT "agents_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "agents" ADD CONSTRAINT "agents_webhookEndpointId_fkey" FOREIGN KEY ("webhookEndpointId") REFERENCES "webhook_endpoints"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "agents" ADD CONSTRAINT "agents_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "webhook_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "companies" ADD CONSTRAINT "companies_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "custom_fields" ADD CONSTRAINT "custom_fields_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "customer_events" ADD CONSTRAINT "customer_events_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "customer_events" ADD CONSTRAINT "customer_events_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "customer_segments" ADD CONSTRAINT "customer_segments_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "sla_policies" ADD CONSTRAINT "sla_policies_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "ticket_forms" ADD CONSTRAINT "ticket_forms_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "survey_configs" ADD CONSTRAINT "survey_configs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "email_channel_configs" ADD CONSTRAINT "email_channel_configs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "shared_drafts" ADD CONSTRAINT "shared_drafts_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "side_conversations" ADD CONSTRAINT "side_conversations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "side_conversations" ADD CONSTRAINT "side_conversations_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "side_conversation_messages" ADD CONSTRAINT "side_conversation_messages_sideConversationId_fkey" FOREIGN KEY ("sideConversationId") REFERENCES "side_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "agent_performance_snapshots" ADD CONSTRAINT "agent_performance_snapshots_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
