// Prisma singleton (Prisma 7 — driver-adapter based).
//
// Prisma 7 has no bundled query engine: the client is constructed with a
// driver adapter. We use the pooled DATABASE_URL (6543) for the app runtime
// (hard rule #3 — DIRECT_URL is for migrations only, via prisma.config.ts).

import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
