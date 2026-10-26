/**
 * CI smoke for a database built only with `prisma migrate deploy`
 * (scripts/ci-migrate-check.sh). Never point it at a real database.
 *
 * 1. Every model in schema.prisma can be read: findFirst selects every
 *    scalar column, so a missing table or column fails here.
 * 2. A workspace can be created the way actions/create-workspace.ts does
 *    it: an owner and widget settings, and no workspaces.apiKey (0005
 *    drops that orphan 0001_init column).
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
    throw new Error("ci-migrate-smoke only runs against a local database");
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  try {
    const models = Object.values(Prisma.ModelName);
    for (const model of models) {
      const delegate = (prisma as unknown as Record<string, { findFirst(): Promise<unknown> }>)[
        model[0].toLowerCase() + model.slice(1)
      ];
      try {
        await delegate.findFirst();
      } catch (error) {
        throw new Error(`model ${model} can't be read: ${error instanceof Error ? error.message.split("\n").pop() : error}`);
      }
    }
    console.log(`read ${models.length} models`);

    const user = await prisma.user.create({ data: { email: `ci-smoke-${Date.now()}@example.test`, name: "CI" } });
    const workspace = await prisma.workspace.create({
      data: {
        name: "CI smoke",
        slug: `ci-smoke-${Date.now()}`,
        members: { create: { userId: user.id, role: "OWNER" } },
        widgetSettings: { create: { workspaceName: "CI smoke" } },
      },
      include: { members: true, widgetSettings: true },
    });
    if (!workspace.appId || workspace.members.length !== 1 || !workspace.widgetSettings) {
      throw new Error("workspace create returned an incomplete row");
    }
    console.log("created a workspace with an appId, an owner and widget settings");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("FAIL:", error instanceof Error ? error.message : error);
  process.exit(1);
});
