-- Corrective, add-only: schema.prisma has Workspace.appId (String @unique
-- @default(cuid())) but no migration created the column, so a database
-- built with `prisma migrate deploy` had no workspaces.appId.
--
-- Safe on a database that already has the column (one made with
-- `prisma db push`): IF NOT EXISTS skips the add, the backfill touches only
-- rows without an appId, and the index is skipped if present. Nothing is
-- dropped or renamed. The default is set by Prisma (cuid()), not by the
-- database, so existing rows get a generated 25-character id here.

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "appId" TEXT;

-- Backfill
UPDATE "workspaces"
SET "appId" = 'c' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 24)
WHERE "appId" IS NULL;

-- AlterTable
ALTER TABLE "workspaces" ALTER COLUMN "appId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "workspaces_appId_key" ON "workspaces"("appId");
