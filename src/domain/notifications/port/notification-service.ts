import { Context, Effect } from 'effect';

export class NotificationService extends Context.Tag('NotificationService')<
  NotificationService,
  {
    readonly notifySuccess: (message: string) => Effect.Effect<void>;
    readonly notifyError: (message: string) => Effect.Effect<void>;
  }
>() {}
