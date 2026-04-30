import { neon } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../generated/prisma/client.ts';

let client: ReturnType<typeof neon>;

export async function getClient() {
  if (!process.env.DATABASE_URL) {
    return undefined;
  }
  if (!client) {
    client = await neon(process.env.DATABASE_URL!);
  }
  return client;
}

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
export const prisma = new PrismaClient({ adapter });