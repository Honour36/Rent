import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma v7 requires a driver adapter. PrismaPg uses the `pg` driver directly.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Singleton pattern - reuse the same instance across hot-reloads in dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
