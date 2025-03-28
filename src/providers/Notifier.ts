import config from '@/config';
import { AccountContactMethod } from '@/models/authentication/authentication';
import { sendEmail } from '@/providers/Emailer';
import { sendMessage } from '@/providers/Messenger';
import Logger from './Logger';

export type Notification<T extends AccountContactMethod> = {
  context?: { contentVariables: Record<string, string | number> };
} & (T extends 'email'
  ? {
      contactMethod: 'email';
      email: string;
      subject: string;
      text: string;
      emailTemplate: string;
    }
  : {
      phone: string;
      contactMethod: 'whatsapp';
      twilioTemplate: string;
    });

export default async function sendNotification<T extends AccountContactMethod>(
  notification: Notification<T>
) {
  if (config.env !== 'production') {
    if (notification.contactMethod === 'email') {
      return Logger.verbose(
        `Skipping on DEV: email ${notification.emailTemplate} to ${notification.email} with subject ${notification.subject}, and context ${JSON.stringify(notification.context ?? {})}`
      );
    } else {
      return Logger.verbose(
        `Skipping on DEV: whatsapp ${notification.twilioTemplate} to ${notification.phone} with context ${JSON.stringify(notification.context ?? {})}`
      );
    }
  }
  switch (notification.contactMethod) {
    case 'email':
      return await sendEmail(notification.email, notification.subject, {
        template: notification.emailTemplate,
        text: notification.text,
        context: notification.context?.contentVariables,
      });
    case 'whatsapp':
      return await sendMessage(`whatsapp:${notification.phone}`, {
        template: notification.twilioTemplate,
        context: notification.context ?? {},
      });
  }
}
