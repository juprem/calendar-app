import handler from '@tanstack/react-start/server-entry';
import { runReminderCron } from '#/domain/reminder/application/controllers/runtime.ts';

export default {
  fetch: (request) => handler.fetch(request),
  scheduled: (controller, _env, executionContext) => {
    executionContext.waitUntil(runReminderCron(new Date(controller.scheduledTime)));
  },
} satisfies ExportedHandler<Env>;
