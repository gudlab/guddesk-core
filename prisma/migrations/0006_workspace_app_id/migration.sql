-- Workspace.appId + drop orphan 0001_init workspaces.apiKey.
-- 0002/0003 are reserved for owner-blocked SQL (flowchat #32/#46/#37).
-- Safe on an empty database and on an upgrade that still has apiKey rows.
-- Prisma sets appId defaults (cuid()) in the client, not in the database.

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN "appId" TEXT;

-- Backfill unique values for existing rows
UPDATE "workspaces"
SET "appId" = 'app_' || "id"
WHERE "appId" IS NULL;

-- AlterTable
ALTER TABLE "workspaces" ALTER COLUMN "appId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_appId_key" ON "workspaces"("appId");

-- Drop orphan 0001_init column
DROP INDEX IF EXISTS "workspaces_apiKey_key";
ALTER TABLE "workspaces" DROP COLUMN "apiKey";
