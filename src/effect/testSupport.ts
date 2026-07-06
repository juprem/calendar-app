import { Cause, Effect, Exit, Option } from 'effect';

/** Runs an effect expected to fail and returns the typed failure, mirroring runEffect's own Cause-unwrapping so tests assert on the real error, not a FiberFailure wrapper. */
export async function runAndExpectFailure<Failure>(effect: Effect.Effect<unknown, Failure>): Promise<Failure> {
  const exit = await Effect.runPromiseExit(effect);

  if (Exit.isSuccess(exit)) throw new Error('Expected the effect to fail, but it succeeded.');

  const failure = Cause.failureOption(exit.cause);
  if (Option.isSome(failure)) return failure.value;

  throw Cause.squash(exit.cause);
}
