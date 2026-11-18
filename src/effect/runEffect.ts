import { Cause, Effect, Exit, Option } from 'effect';

/** Runs an effect as a Promise: a typed failure rejects with the original error instance, a defect rejects with the squashed cause. */
export async function runEffect<Value, Failure>(effect: Effect.Effect<Value, Failure>): Promise<Value> {
  const exit = await Effect.runPromiseExit(effect);

  if (Exit.isSuccess(exit)) return exit.value;

  const failure = Cause.findErrorOption(exit.cause);
  if (Option.isSome(failure)) throw failure.value;

  throw Cause.squash(exit.cause);
}
