import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

// prisma generate (postinstall) must work before a .env exists.
// `env("DATABASE_URL")` throws PrismaConfigEnvError on a fresh clone.
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/postgres";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: databaseUrl,
  },
});
