import { Cause, Effect, Exit, Option } from 'effect';

/** Effect.runPromise rejects with a FiberFailure wrapper, losing instanceof-ability on typed errors — this unwraps to the real failure value instead. */
export async function runEffect<Value, Failure>(effect: Effect.Effect<Value, Failure>): Promise<Value> {
  const exit = await Effect.runPromiseExit(effect);

  if (Exit.isSuccess(exit)) return exit.value;

  const failure = Cause.failureOption(exit.cause);
  if (Option.isSome(failure)) throw failure.value;

  throw Cause.squash(exit.cause);
}
