import { Effect, Layer } from 'effect';
import { toast } from 'sonner';
import { NotificationService } from '../port/notification-service.ts';

export const NotificationServiceLive = Layer.succeed(NotificationService, {
  notifySuccess: (message) => Effect.sync(() => toast.success(message)),
  notifyError: (message) => Effect.sync(() => toast.error(message)),
});
