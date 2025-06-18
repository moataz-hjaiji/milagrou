import twilio from 'twilio';
import { twilioSettings } from '../../configVars';

export interface MessageSettings {
  to: string; // recipient phone, e.g. +1234567890
  contentSid: string; // content template SID, e.g. HXxxxxxx
  // messagingServiceSid: string; // your Messaging Service SID, e.g. MGxxxxx
  variables: Record<string, string>; // e.g. { "1": "Amine" }
}

export const sendTwilioMessage = async (settings: MessageSettings) => {
  const { accountSid, authToken } = twilioSettings;
  const client = twilio(accountSid, authToken);

  try {
    const message = await client.messages.create({
      to: `whatsapp:${settings.to}`,
      from: `whatsapp:+96560025009`,
      // messagingServiceSid: 'MGb45f9459d650d773c31ce5dbb1685092',
      body: 'your code is 123456',
      // contentSid: settings.contentSid,x
      // contentVariables: JSON.stringify(settings.variables),
    });

    console.log('Message SID:', message);
    return message;
  } catch (error: any) {
    console.error(`Error sending WhatsApp template: ${error.message}`);
    throw error;
  }
};
