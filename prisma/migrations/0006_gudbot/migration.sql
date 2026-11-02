-- GudBot v1 first slice. Additive only.
-- Next available number in core is 0006 (0004 is workspaces_app_id,
-- 0005 is schema catch-up). Do not reuse flowchat 0004.
-- Do not touch owner-blocked 0002-style work.

-- CreateEnum
CREATE TYPE "AiResolutionMethod" AS ENUM ('ANSWERED', 'HANDED_OFF', 'ESCALATED_LATER', 'CLOSED_BY_VISITOR');

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN "assignedAt" TIMESTAMP(3),
ADD COLUMN "aiResolved" BOOLEAN,
ADD COLUMN "aiResolutionMethod" "AiResolutionMethod",
ADD COLUMN "aiHandoffReason" TEXT,
ADD COLUMN "aiHandoffAt" TIMESTAMP(3),
ADD COLUMN "aiFinalConfidence" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "gudbot_settings" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "confidenceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "maxTurns" INTEGER NOT NULL DEFAULT 4,
    "handoffMessage" TEXT NOT NULL DEFAULT 'Connecting you with our team. They''ll have full context.',
    "channels" TEXT[] NOT NULL DEFAULT ARRAY['widget']::TEXT[],
    "optOutTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gudbot_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_turns" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "modelSelf" DOUBLE PRECISION NOT NULL,
    "evidenceScore" DOUBLE PRECISION NOT NULL,
    "effective" DOUBLE PRECISION NOT NULL,
    "citationsJson" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_turns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gudbot_settings_workspaceId_key" ON "gudbot_settings"("workspaceId");

-- CreateIndex
CREATE INDEX "ai_turns_conversationId_idx" ON "ai_turns"("conversationId");

-- CreateIndex
CREATE INDEX "ai_turns_workspaceId_created_at_idx" ON "ai_turns"("workspaceId", "created_at");

-- AddForeignKey
ALTER TABLE "gudbot_settings" ADD CONSTRAINT "gudbot_settings_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_turns" ADD CONSTRAINT "ai_turns_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_turns" ADD CONSTRAINT "ai_turns_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
