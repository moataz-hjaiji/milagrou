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

export const googleAuthProvider = async (idToken: string) => {
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

  // Get Google user data
  const googleUser = await authManager.getUserData('google', {
    accessToken: idToken,
  });

  const userCheck = await UserRepo.findByObj({
    email: googleUser.email,
  });

  if (!userCheck) {
    const roleUser = await RoleRepo.findByCode('user');
    if (!roleUser) throw new NotFoundError('user role not found');

    const user = await UserRepo.create({
      email: googleUser?.email!,
      firstName: googleUser?.firstName!,
      lastName: googleUser?.lastName!,
      avatar: googleUser?.avatar!,
      roles: [roleUser.id],
      verified: true,
      emailIsVerified: true,
      lastLogin: new Date(),
    });

    const { accessTokenKey, refreshTokenKey } = generateKeys();
    await KeystoreRepo.create(user.id, accessTokenKey, refreshTokenKey);
    const [tokens] = await Promise.all([
      createTokens(user, accessTokenKey, refreshTokenKey),
      user,
    ]);

    return {
      tokens,
      user,
    };
  } else {
    const { accessTokenKey, refreshTokenKey } = generateKeys();
    await KeystoreRepo.create(userCheck.id, accessTokenKey, refreshTokenKey);
    const [tokens] = await Promise.all([
      createTokens(userCheck, accessTokenKey, refreshTokenKey),
      userCheck,
    ]);

    return {
      tokens,
      user: userCheck,
    };
  }

  return googleUser;

  // // Get Apple user data
  // const appleUser = await authManager.getUserData('apple', {
  //   idToken: 'apple_id_token_here',
  //   clientId: process.env.APPLE_CLIENT_ID!,
  // });

  // Get WhatsApp user data
  const whatsappUser = await authManager.getUserData('whatsapp', {
    phoneNumber: '+1234567890',
    code: '123456',
  });

  // Send WhatsApp verification
  const verificationResponse =
    await authManager.sendWhatsAppVerification('+1234567890');

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
