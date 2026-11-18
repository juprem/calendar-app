import { Context, Effect } from 'effect';

export class NotificationService extends Context.Service<
  NotificationService,
  {
    readonly notifySuccess: (message: string) => Effect.Effect<void>;
    readonly notifyError: (message: string) => Effect.Effect<void>;
  }
>()('NotificationService') {}
