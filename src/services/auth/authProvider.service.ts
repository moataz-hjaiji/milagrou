import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import twilio from 'twilio';
import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError } from '../../core/ApiError';
import { AuthProviderManager } from './signinWithProvider.service';

export const authProvider = async (idToken: string) => {
  // Initialize the manager
  const authManager = new AuthProviderManager({
    google: {
      clientId:
        '389740496236-9rdqer94cfhna66iqepfkarkd25akej3.apps.googleusercontent.com',
    },
    // whatsapp: {
    //   accountSid: process.env.TWILIO_ACCOUNT_SID!,
    //   authToken: process.env.TWILIO_AUTH_TOKEN!,
    //   verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID!,
    // },
  });

  // Get Google user data
  const googleUser = await authManager.getUserData('google', {
    accessToken: idToken,
  });

  return googleUser;

  // // Get Apple user data
  // const appleUser = await authManager.getUserData('apple', {
  //   idToken: 'apple_id_token_here',
  //   clientId: process.env.APPLE_CLIENT_ID!,
  // });

  // // Get WhatsApp user data
  // const whatsappUser = await authManager.getUserData('whatsapp', {
  //   phoneNumber: '+1234567890',
  //   code: '123456'
  // });

  // // Send WhatsApp verification
  // const verificationResponse = await authManager.sendWhatsAppVerification('+1234567890');

  // All return normalized data structure:
  // {
  //   provider: 'google|apple|whatsapp',
  //   providerId: 'unique_id_from_provider',
  //   email: 'user@example.com',
  //   phone: '+1234567890',
  //   name: 'John Doe',
  //   firstName: 'John',
  //   lastName: 'Doe',
  //   avatar: 'https://avatar-url.com',
  //   emailVerified: true,
  //   phoneVerified: true,
  //   metadata: { // raw provider data }
  // }

  // throw new BadRequestError('invalid verification code');
};
