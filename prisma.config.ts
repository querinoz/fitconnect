import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    // Prisma CLI (migrate, db push): prefer direct URL; app runtime still uses DATABASE_URL
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL
  }
});
