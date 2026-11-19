import handler from '@tanstack/react-start/server-entry';
import { runReminderCron } from '#/domain/reminder/application/controllers/runtime.ts';
import { withSecurityHeaders } from '#/server/securityHeaders.ts';

export default {
  fetch: async (request) => withSecurityHeaders(await handler.fetch(request)),
  scheduled: (controller, _env, executionContext) => {
    executionContext.waitUntil(runReminderCron(new Date(controller.scheduledTime)));
  },
} satisfies ExportedHandler<Env>;
