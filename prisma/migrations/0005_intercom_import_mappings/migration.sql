-- Intercom importer v1. Additive only.
-- 0002/0003 are reserved for owner-blocked SQL (flowchat #32/#46/#37).
-- 0004_gudbot already landed.

-- CreateTable
CREATE TABLE "import_mappings" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "localId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "import_mappings_workspaceId_source_entityType_idx" ON "import_mappings"("workspaceId", "source", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "import_mappings_workspaceId_source_entityType_externalId_key" ON "import_mappings"("workspaceId", "source", "entityType", "externalId");

-- AddForeignKey
ALTER TABLE "import_mappings" ADD CONSTRAINT "import_mappings_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
