import { Effect, Layer } from 'effect';
import { EmailSendError } from '#/effect/errors.ts';
import { EmailSender } from '../../port/email-sender.ts';

const BREVO_SEND_URL = 'https://api.brevo.com/v3/smtp/email';

const readRequiredEnv = (name: 'BREVO_API_KEY' | 'BREVO_TEMPLATE_ID'): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} manquant dans la configuration`);
  return value;
};

const readBrevoErrorMessage = async (response: Response): Promise<string> => {
  const body: unknown = await response.json().catch(() => null);
  const message = typeof body === 'object' && body !== null && 'message' in body ? body.message : null;
  return typeof message === 'string' ? message : `Brevo a répondu ${response.status}`;
};

export const EmailSenderBrevo = Layer.succeed(EmailSender, {
  send: (email) =>
    Effect.tryPromise({
      try: async () => {
        const apiKey = readRequiredEnv('BREVO_API_KEY');
        const templateId = Number(readRequiredEnv('BREVO_TEMPLATE_ID'));
        const response = await fetch(BREVO_SEND_URL, {
          method: 'POST',
          headers: { 'api-key': apiKey, 'content-type': 'application/json' },
          body: JSON.stringify({
            to: [email.to],
            templateId,
            params: email.params,
          }),
        });
        if (!response.ok) throw new Error(await readBrevoErrorMessage(response));
      },
      catch: (cause) =>
        new EmailSendError({ message: cause instanceof Error ? cause.message : "Échec de l'envoi de l'email" }),
    }),
});
