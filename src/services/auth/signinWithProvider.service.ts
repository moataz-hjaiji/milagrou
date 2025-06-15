// authProviders.ts - Type-safe authentication provider implementations

import { OAuth2Client, TokenPayload } from 'google-auth-library';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import twilio from 'twilio';

// Type definitions
interface GoogleUserData {
  provider: 'google';
  providerId: string;
  email: string;
  emailVerified: boolean;
  name: string;
  firstName: string;
  lastName: string;
  avatar: string;
  locale: string;
  raw: TokenPayload;
}

interface AppleUserData {
  provider: 'apple';
  providerId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  isPrivateEmail: boolean;
  raw: AppleJWTPayload;
}

interface WhatsAppUserData {
  provider: 'whatsapp';
  providerId: string;
  phone: string;
  phoneVerified: boolean;
  email: string | null;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  verificationSid: string;
  raw: any;
}

interface NormalizedUserData {
  provider: string;
  providerId: string;
  email: string | null;
  phone: string | null;
  name: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  metadata: Record<string, unknown>;
  locale?: string;
  isPrivateEmail?: boolean;
  verificationSid?: string;
}

interface AuthProviderConfig {
  google: {
    clientId: string;
  };
  // whatsapp: {
  //   accountSid: string;
  //   authToken: string;
  //   verifyServiceSid: string;
  // };
}

interface GoogleCredentials {
  idToken?: string;
  accessToken?: string;
}

interface AppleCredentials {
  idToken: string;
  clientId: string;
}

interface WhatsAppCredentials {
  phoneNumber: string;
  code: string;
}

// Apple JWT payload interface
interface AppleJWTPayload extends JwtPayload {
  sub: string;
  email?: string;
  email_verified?: string;
  is_private_email?: string;
}

// Apple user name interface
interface AppleUserName {
  firstName?: string;
  lastName?: string;
}

interface AppleUserInfo {
  name?: AppleUserName;
}

// Google API response interface
interface GoogleAPIUserData {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

// WhatsApp verification response
interface WhatsAppVerificationResponse {
  success: boolean;
  sid: string;
  status: string;
  to: string;
  channel: string;
}

// Google Auth Data Retrieval
class GoogleAuthProvider {
  private client: OAuth2Client;

  constructor(clientId: string) {
    this.client = new OAuth2Client(clientId);
  }

  // Verify Google ID token and extract user data
  async verifyGoogleToken(idToken: string): Promise<GoogleUserData> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        // audience: process.env.GOOGLE_CLIENT_ID as string,
        audience:
          '389740496236-9rdqer94cfhna66iqepfkarkd25akej3.apps.googleusercontent.com',
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error('No payload in Google token');
      }

      if (!payload.sub || !payload.email || !payload.name) {
        throw new Error('Missing required fields in Google token payload');
      }

      return {
        provider: 'google',
        providerId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified ?? false,
        name: payload.name,
        firstName: payload.given_name ?? '',
        lastName: payload.family_name ?? '',
        avatar: payload.picture ?? '',
        locale: payload.locale ?? '',
        raw: payload,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Google token verification failed: ${errorMessage}`);
    }
  }

  // Get user data using access token
  async getUserDataFromAccessToken(
    accessToken: string
  ): Promise<GoogleUserData> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`);
      }

      const userData: GoogleAPIUserData = await response.json();

      if (!userData.id || !userData.email || !userData.name) {
        throw new Error('Missing required fields in Google API response');
      }

      // Create a minimal TokenPayload for consistency
      const tokenPayload: any = {
        sub: userData.id,
        email: userData.email,
        name: userData.name,
        given_name: userData.given_name,
        family_name: userData.family_name,
        picture: userData.picture,
        locale: userData.locale,
        email_verified: userData.verified_email,
      };

      return {
        provider: 'google',
        providerId: userData.id,
        email: userData.email,
        emailVerified: userData.verified_email,
        name: userData.name,
        firstName: userData.given_name,
        lastName: userData.family_name,
        avatar: userData.picture,
        locale: userData.locale,
        raw: tokenPayload,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch Google user data: ${errorMessage}`);
    }
  }
}

// Apple Auth Data Retrieval
class AppleAuthProvider {
  private jwksClient: jwksClient.JwksClient;

  constructor() {
    this.jwksClient = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000, // 10 minutes
    });
  }

  // Get Apple's public key for token verification
  async getApplePublicKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.jwksClient.getSigningKey(kid, (err, key) => {
        if (err) {
          reject(err);
        } else if (!key) {
          reject(new Error('No key found'));
        } else {
          resolve(key.getPublicKey());
        }
      });
    });
  }

  // Verify Apple ID token and extract user data
  async verifyAppleToken(
    idToken: string,
    clientId: string
  ): Promise<AppleUserData> {
    try {
      // Decode token header to get key ID
      const decoded = jwt.decode(idToken, { complete: true });
      if (!decoded || typeof decoded === 'string') {
        throw new Error('Invalid Apple ID token');
      }

      const { kid } = decoded.header;
      if (!kid) {
        throw new Error('Missing kid in Apple token header');
      }

      const publicKey = await this.getApplePublicKey(kid);

      // Verify token
      const payload = jwt.verify(idToken, publicKey, {
        algorithms: ['RS256'],
        audience: clientId,
        issuer: 'https://appleid.apple.com',
      }) as AppleJWTPayload;

      if (!payload.sub) {
        throw new Error('Missing sub in Apple token payload');
      }

      return {
        provider: 'apple',
        providerId: payload.sub,
        email: payload.email || null,
        emailVerified: payload.email_verified === 'true',
        name: null, // Apple doesn't provide name in JWT, only during first auth
        firstName: null,
        lastName: null,
        avatar: null,
        isPrivateEmail: payload.is_private_email === 'true',
        raw: payload,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Apple token verification failed: ${errorMessage}`);
    }
  }

  // Parse Apple user data from form submission (first-time auth)
  async parseAppleUserData(
    identityToken: string,
    user?: string | AppleUserInfo
  ): Promise<AppleUserData> {
    try {
      const tokenData = await this.verifyAppleToken(
        identityToken,
        process.env.APPLE_CLIENT_ID as string
      );

      // User data is only provided on first authorization
      const userData: AppleUserData = {
        provider: 'apple',
        providerId: tokenData.providerId,
        email: tokenData.email,
        emailVerified: tokenData.emailVerified,
        name: null,
        firstName: null,
        lastName: null,
        avatar: null,
        isPrivateEmail: tokenData.isPrivateEmail,
        raw: tokenData.raw,
      };

      // Parse user name if provided (only on first auth)
      if (user) {
        let userObj: AppleUserInfo;

        if (typeof user === 'string') {
          try {
            userObj = JSON.parse(user) as AppleUserInfo;
          } catch {
            throw new Error('Invalid JSON in user parameter');
          }
        } else {
          userObj = user;
        }

        if (userObj.name) {
          userData.firstName = userObj.name.firstName || null;
          userData.lastName = userObj.name.lastName || null;
          userData.name =
            `${userObj.name.firstName || ''} ${userObj.name.lastName || ''}`.trim() ||
            null;
        }
      }

      return userData;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to parse Apple user data: ${errorMessage}`);
    }
  }
}

// WhatsApp Auth Data Retrieval
class WhatsAppAuthProvider {
  private client: twilio.Twilio;
  private verifyServiceSid: string;

  constructor(accountSid: string, authToken: string, verifyServiceSid: string) {
    this.client = twilio(accountSid, authToken);
    this.verifyServiceSid = verifyServiceSid;
  }

  // Send verification code via WhatsApp
  async sendVerificationCode(
    phoneNumber: string
  ): Promise<WhatsAppVerificationResponse> {
    try {
      const verification = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verifications.create({
          to: phoneNumber,
          channel: 'whatsapp',
        });

      return {
        success: true,
        sid: verification.sid,
        status: verification.status,
        to: verification.to,
        channel: verification.channel,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send WhatsApp verification: ${errorMessage}`);
    }
  }

  // Verify the code and return user data
  async verifyCodeAndGetUserData(
    phoneNumber: string,
    code: string
  ): Promise<WhatsAppUserData> {
    try {
      const verificationCheck = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({
          to: phoneNumber,
          code: code,
        });

      if (verificationCheck.status !== 'approved') {
        throw new Error('Invalid verification code');
      }

      // Format phone number for consistency
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      return {
        provider: 'whatsapp',
        providerId: formattedPhone,
        phone: formattedPhone,
        phoneVerified: true,
        email: null,
        name: null, // WhatsApp doesn't provide name
        firstName: null,
        lastName: null,
        avatar: null,
        verificationSid: verificationCheck.sid,
        raw: verificationCheck,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`WhatsApp verification failed: ${errorMessage}`);
    }
  }

  // Optional: Get WhatsApp profile info if you have WhatsApp Business API
  async getWhatsAppProfile(
    phoneNumber: string,
    accessToken: string
  ): Promise<{
    provider: 'whatsapp';
    providerId: string;
    phone: string;
    name: string | null;
    avatar: string | null;
    status: string | null;
    raw: Record<string, unknown>;
  }> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumber}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status}`);
      }

      const profileData: Record<string, unknown> = await response.json();

      return {
        provider: 'whatsapp',
        providerId: phoneNumber,
        phone: phoneNumber,
        name: (profileData.display_name as string) || null,
        avatar: (profileData.profile_picture_url as string) || null,
        status: (profileData.status as string) || null,
        raw: profileData,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch WhatsApp profile: ${errorMessage}`);
    }
  }

  // Utility function to format phone numbers consistently
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except +
    let formatted = phoneNumber.replace(/[^\d+]/g, '');

    // Ensure it starts with +
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }

    return formatted;
  }
}

// Unified Auth Provider Manager
class AuthProviderManager {
  private google: GoogleAuthProvider;
  // private apple: AppleAuthProvider;
  // private whatsapp: WhatsAppAuthProvider;

  constructor(config: AuthProviderConfig) {
    this.google = new GoogleAuthProvider(config.google.clientId);
    // this.apple = new AppleAuthProvider();
    // this.whatsapp = new WhatsAppAuthProvider(
    //   config.whatsapp.accountSid,
    //   config.whatsapp.authToken,
    //   config.whatsapp.verifyServiceSid
    // );
  }

  // Normalize user data from any provider
  normalizeUserData(
    providerData: GoogleUserData | AppleUserData | WhatsAppUserData
  ): NormalizedUserData {
    const baseData: NormalizedUserData = {
      provider: providerData.provider,
      providerId: providerData.providerId,
      email: providerData.email || null,
      phone: 'phone' in providerData ? providerData.phone : null,
      name: providerData.name || 'User',
      firstName: providerData.firstName || null,
      lastName: providerData.lastName || null,
      avatar: providerData.avatar || null,
      emailVerified:
        'emailVerified' in providerData ? providerData.emailVerified : false,
      phoneVerified:
        'phoneVerified' in providerData ? providerData.phoneVerified : false,
      metadata: providerData.raw as Record<string, unknown>,
    };

    // Provider-specific additions
    switch (providerData.provider) {
      case 'google':
        baseData.locale = (providerData as GoogleUserData).locale;
        break;
      case 'apple':
        baseData.isPrivateEmail = (
          providerData as AppleUserData
        ).isPrivateEmail;
        break;
      case 'whatsapp':
        baseData.verificationSid = (
          providerData as WhatsAppUserData
        ).verificationSid;
        break;
    }

    return baseData;
  }

  // Get user data based on provider and token/credentials - using overloads for type safety
  async getUserData(
    provider: 'google',
    credentials: GoogleCredentials
  ): Promise<NormalizedUserData>;
  async getUserData(
    provider: 'apple',
    credentials: AppleCredentials
  ): Promise<NormalizedUserData>;
  async getUserData(
    provider: 'whatsapp',
    credentials: WhatsAppCredentials
  ): Promise<NormalizedUserData>;
  async getUserData(
    provider: 'google' | 'apple' | 'whatsapp',
    credentials: GoogleCredentials | AppleCredentials | WhatsAppCredentials
  ): Promise<NormalizedUserData> {
    try {
      let providerData: GoogleUserData | AppleUserData | WhatsAppUserData;

      switch (provider) {
        case 'google': {
          const googleCreds = credentials as GoogleCredentials;
          if (googleCreds.idToken) {
            providerData = await this.google.verifyGoogleToken(
              googleCreds.idToken
            );
          } else if (googleCreds.accessToken) {
            providerData = await this.google.getUserDataFromAccessToken(
              googleCreds.accessToken
            );
          } else {
            throw new Error(
              'Google credentials missing: idToken or accessToken required'
            );
          }
          break;
        }

        // case 'apple': {
        //   const appleCreds = credentials as AppleCredentials;
        //   if (appleCreds.idToken) {
        //     providerData = await this.apple.verifyAppleToken(
        //       appleCreds.idToken,
        //       appleCreds.clientId
        //     );
        //   } else {
        //     throw new Error('Apple credentials missing: idToken required');
        //   }
        //   break;
        // }

        // case 'whatsapp': {
        //   const whatsappCreds = credentials as WhatsAppCredentials;
        //   if (whatsappCreds.phoneNumber && whatsappCreds.code) {
        //     providerData = await this.whatsapp.verifyCodeAndGetUserData(
        //       whatsappCreds.phoneNumber,
        //       whatsappCreds.code
        //     );
        //   } else {
        //     throw new Error(
        //       'WhatsApp credentials missing: phoneNumber and code required'
        //     );
        //   }
        //   break;
        // }

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      return this.normalizeUserData(providerData);
    } catch (error) {
      // Re-throw the error to maintain the original error message
      throw error;
    }
  }

  // // Additional helper methods
  // async sendWhatsAppVerification(
  //   phoneNumber: string
  // ): Promise<WhatsAppVerificationResponse> {
  //   return this.whatsapp.sendVerificationCode(phoneNumber);
  // }

  // async parseAppleUserData(
  //   identityToken: string,
  //   user?: string | AppleUserInfo
  // ): Promise<AppleUserData> {
  //   return this.apple.parseAppleUserData(identityToken, user);
  // }
}

// Export everything
export {
  GoogleAuthProvider,
  AppleAuthProvider,
  WhatsAppAuthProvider,
  AuthProviderManager,
  type GoogleUserData,
  type AppleUserData,
  type WhatsAppUserData,
  type NormalizedUserData,
  type AuthProviderConfig,
  type GoogleCredentials,
  type AppleCredentials,
  type WhatsAppCredentials,
  type AppleJWTPayload,
  type AppleUserInfo,
  type WhatsAppVerificationResponse,
};
