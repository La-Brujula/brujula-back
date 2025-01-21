import Logger from './Logger';
import config from '@/config';
import twilio from 'twilio';

// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const { authToken, accountSid } = config.twilio;
const client = twilio(accountSid, authToken);

export async function createWhatsappConversation(phoneNumber: string) {
  client.conversations.v1
    .conversations('CH1fe32291f34a47eb9baea63f6efee26d')
    .participants.create({
      'messagingBinding.address': `whatsapp:${phoneNumber}`,
      'messagingBinding.proxyAddress': 'whatsapp:+14155238886',
    })
    .then((participant) => console.log(participant.sid));
}

export async function sendWhatsapp(
  conversation: string,
  content: {
    text?: string;
    template: string;
    context?: any;
  }
): Promise<boolean> {
  await client.conversations.v1.conversations(conversation).messages.create({
    author: 'system',
    contentSid: 'HX2e55c44019ac610f8dc02e8611e4a604',
    contentVariables: '{"1":"2024","2":"00"}',
  });
  Logger.info(`Sent whatsapp to ${conversation}`);
  return true;
}
