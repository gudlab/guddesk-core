// import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@prisma/client";

declare global {
  var cachedPrisma: PrismaClient;
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = createPrismaClient();
  }
  prisma = global.cachedPrisma;
}
