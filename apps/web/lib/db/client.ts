import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL!.trim();
  const pool = new Pool({ connectionString });
  globalForPrisma.prismaPool = pool;
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * Lazy Prisma client — avoids constructor errors in demo builds without DATABASE_URL.
 * If Prisma construction fails, return null so the app can continue in demo mode.
 */
export function getPrisma(): PrismaClient | null {
  if (!isDatabaseConfigured()) return null;
  if (!globalForPrisma.prisma) {
    try {
      globalForPrisma.prisma = createClient();
    } catch (err) {
      // Don't throw during dev/demo — log and fall back to null
      // eslint-disable-next-line no-console
      console.warn("Prisma client construction failed, continuing in demo mode:", err);
      return null;
    }
  }
  return globalForPrisma.prisma;
}
