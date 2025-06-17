import twilio from 'twilio';
import { twilioSettings } from '../../configVars';

export interface MessageSettings {
  body: string;
  to: string;
}

export const sendTwilioMessage = async (messageSettings: MessageSettings) => {
  const { accountSid, authToken, phoneNumber } = twilioSettings;
  const client = twilio(accountSid, authToken);

  const messageCreateOptions: any = {
    body: messageSettings.body,
    from: phoneNumber,
    to: `whatsapp:${messageSettings.to}`,
  };

  await client.messages
    .create(messageCreateOptions) // Type assertion for MessageCreateOptions
    .then((message: any) => {
      return message.sid;
    })
    .catch((error: any) => {
      console.error(`Error sending message: ${error.message}`);
      throw error;
    });
};
