import { PrismaClient } from '@prisma/client';
let client: PrismaClient | undefined;
export function database() { return client ??= new PrismaClient(); }
export async function checkDatabase(): Promise<void> {
  if (!process.env.DATABASE_URL) throw new Error('Database is not configured');
  await database().$queryRaw`SELECT 1`;
}
export async function disconnectDatabase() { await client?.$disconnect(); }
