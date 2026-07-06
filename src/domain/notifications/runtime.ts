import { Effect } from 'effect';
import { NotificationServiceLive } from './adapter/notification-service-live.ts';
import { NotificationService } from './port/notification-service.ts';

const runNotification = (effect: Effect.Effect<void, never, NotificationService>): void =>
  Effect.runSync(effect.pipe(Effect.provide(NotificationServiceLive)));

export const notifySuccess = (message: string): void =>
  runNotification(
    Effect.gen(function* () {
      const notificationService = yield* NotificationService;
      yield* notificationService.notifySuccess(message);
    }),
  );

export const notifyErrorService = (error: { message: string }, defaultMessage: string): void =>
  runNotification(
    Effect.gen(function* () {
      const notificationService = yield* NotificationService;
      yield* notificationService.notifyError(error.message || defaultMessage);
    }),
  );
