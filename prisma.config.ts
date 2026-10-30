import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// The Prisma CLI does not load env files on its own (Next.js loading
// .env.local does not apply here), so load it explicitly. Run Prisma
// commands from the project root.
config({ path: ".env.local", quiet: true });

// CLI commands (migrate, db push, studio) use the direct, unpooled URL.
// The app runtime uses the pooled DATABASE_URL via lib/db.ts.
// process.env (not env()) keeps `prisma generate` and `prisma validate`
// usable before credentials exist; commands that connect will fail
// without it.
const directUrl = process.env.DATABASE_URL_UNPOOLED;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  ...(directUrl ? { datasource: { url: directUrl } } : {}),
});
