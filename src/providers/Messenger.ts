import Logger from './Logger';
import twilio from 'twilio';
import config from '@/config';

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

type MessageContext = {
  contentVariables?: Record<string, string | number | boolean>;
};

export async function sendMessage(
  to: string,
  content: {
    template: string;
    context: MessageContext;
  }
): Promise<boolean> {
  const ctx = content.context.contentVariables!;
  Logger.verbose(
    [
      content.template,
      JSON.stringify(ctx),
      config.twilio.number,
      config.twilio.messagingService,
      to,
    ].join(' ')
  );
  try {
    await client.messages.create({
      contentSid: 'HXd11b836bac99f9c4a600f3b03aae7701',
      contentVariables: JSON.stringify(ctx),
      from: config.twilio.messagingService,
      to: to,
    });
    Logger.verbose(`Sent with Twilio to ${to}`);
    return true;
  } catch (e) {
    Logger.error(`Encountered error while sending twilio: ${e}`);
    return false;
  }
}
