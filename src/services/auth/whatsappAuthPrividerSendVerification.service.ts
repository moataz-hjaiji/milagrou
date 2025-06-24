import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import twilio from 'twilio';
import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import { AuthProviderManager } from './signinWithProvider.service';
import { authProviders, twilioSettings } from '../../configVars';
import RoleRepo from '../../database/repository/RoleRepo';
import { generateKeys } from '../../helpers/utils/auth';
import KeystoreRepo from '../../database/repository/KeystoreRepo';
import { createTokens } from '../../authUtils/authUtils';
import {
  // MessageSettings,
  sendTwilioMessage,
} from '../../helpers/utils/smsSender';

export const whatsappAuthPrividerSendVerification = async () => {
  // Initialize the manager
  const authManager = new AuthProviderManager({
    google: {
      clientId: authProviders.googleClientId!,
    },
    whatsapp: {
      accountSid: twilioSettings.accountSid!,
      authToken: twilioSettings.authToken!,
      verifyServiceSid: twilioSettings.verifySid!,
    },
  });

  // Send WhatsApp verification
  // const verificationResponse =
  //   await authManager.sendWhatsAppVerification('+21654867711');

  // const messageSettings: MessageSettings = {
  //   bodyParams: ['123456'],
  //   to: '+21654867711',
  // };
  // sendTwilioMessage(messageSettings);

  return await sendTwilioMessage();

  // return verificationResponse;
};
