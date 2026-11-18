import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Config, Context, Effect, Layer } from 'effect';
import { PrismaClient } from '../generated/prisma/client.ts';

neonConfig.poolQueryViaFetch = true;

export class Prisma extends Context.Service<Prisma, PrismaClient>()('Prisma') {}

/** Workers forbid sharing I/O across requests, so every Effect run builds its own client here and disconnects it when the run ends; a failed disconnect is ignored so it can't fail a request that already succeeded. */
export const PrismaLive = Layer.effect(
  Prisma,
  Effect.acquireRelease(
    Effect.gen(function* () {
      const connectionString = yield* Config.String('DATABASE_URL');
      return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
    }).pipe(Effect.orDie),
    (client) => Effect.tryPromise(() => client.$disconnect()).pipe(Effect.ignore),
  ),
);
