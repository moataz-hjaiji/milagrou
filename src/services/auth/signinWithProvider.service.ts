// // authProviders.ts - Core data retrieval functions

// import { OAuth2Client } from 'google-auth-library';
// import jwt from 'jsonwebtoken';
// import jwksClient from 'jwks-rsa';
// import twilio from 'twilio';

// // Type definitions
// interface GoogleUserData {
//   provider: 'google';
//   providerId: string;
//   email: string;
//   emailVerified: boolean;
//   name: string;
//   firstName: string;
//   lastName: string;
//   avatar: string;
//   locale: string;
//   raw: any;
// }

// interface AppleUserData {
//   provider: 'apple';
//   providerId: string;
//   email: string | null;
//   emailVerified: boolean;
//   name: string | null;
//   firstName: string | null;
//   lastName: string | null;
//   avatar: string | null;
//   isPrivateEmail: boolean;
//   raw: any;
// }

// interface WhatsAppUserData {
//   provider: 'whatsapp';
//   providerId: string;
//   phone: string;
//   phoneVerified: boolean;
//   email: string | null;
//   name: string | null;
//   firstName: string | null;
//   lastName: string | null;
//   avatar: string | null;
//   verificationSid: string;
//   raw: any;
// }

// interface NormalizedUserData {
//   provider: string;
//   providerId: string;
//   email: string | null;
//   phone: string | null;
//   name: string;
//   firstName: string | null;
//   lastName: string | null;
//   avatar: string | null;
//   emailVerified: boolean;
//   phoneVerified: boolean;
//   metadata: any;
//   locale?: string;
//   isPrivateEmail?: boolean;
//   verificationSid?: string;
// }

// interface AuthProviderConfig {
//   google: {
//     clientId: string;
//   };
//   whatsapp: {
//     accountSid: string;
//     authToken: string;
//     verifyServiceSid: string;
//   };
// }

// interface GoogleCredentials {
//   idToken?: string;
//   accessToken?: string;
// }

// interface AppleCredentials {
//   idToken: string;
//   clientId: string;
// }

// interface WhatsAppCredentials {
//   phoneNumber: string;
//   code: string;
// }

// // Google Auth Data Retrieval
// class GoogleAuthProvider {
//   private client: OAuth2Client;

//   constructor(clientId: string) {
//     this.client = new OAuth2Client(clientId);
//   }

//   // Verify Google ID token and extract user data
//   async verifyGoogleToken(idToken: string): Promise<GoogleUserData> {
//     try {
//       const ticket = await this.client.verifyIdToken({
//         idToken: idToken,
//         audience: process.env.GOOGLE_CLIENT_ID as string,
//       });

//       const payload = ticket.getPayload();

//       return {
//         provider: 'google',
//         providerId: payload.sub,
//         email: payload.email,
//         emailVerified: payload.email_verified,
//         name: payload.name,
//         firstName: payload.given_name,
//         lastName: payload.family_name,
//         avatar: payload.picture,
//         locale: payload.locale,
//         raw: payload,
//       };
//     } catch (error) {
//       throw new Error(`Google token verification failed: ${error.message}`);
//     }
//   }

//   // Get user data using access token
//   async getUserDataFromAccessToken(
//     accessToken: string
//   ): Promise<GoogleUserData> {
//     try {
//       const response = await fetch(
//         `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
//       );

//       if (!response.ok) {
//         throw new Error(`Google API error: ${response.status}`);
//       }

//       const userData = await response.json();

//       return {
//         provider: 'google',
//         providerId: userData.id,
//         email: userData.email,
//         emailVerified: userData.verified_email,
//         name: userData.name,
//         firstName: userData.given_name,
//         lastName: userData.family_name,
//         avatar: userData.picture,
//         locale: userData.locale,
//         raw: userData,
//       };
//     } catch (error) {
//       throw new Error(`Failed to fetch Google user data: ${error.message}`);
//     }
//   }
// }

// // Apple Auth Data Retrieval
// class AppleAuthProvider {
//   private jwksClient: jwksClient.JwksClient;

//   constructor() {
//     this.jwksClient = jwksClient({
//       jwksUri: 'https://appleid.apple.com/auth/keys',
//       cache: true,
//       cacheMaxEntries: 5,
//       cacheMaxAge: 600000, // 10 minutes
//     });
//   }

//   // Get Apple's public key for token verification
//   async getApplePublicKey(kid: string): Promise<string> {
//     return new Promise((resolve, reject) => {
//       this.jwksClient.getSigningKey(kid, (err, key) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(key.getPublicKey());
//         }
//       });
//     });
//   }

//   // Verify Apple ID token and extract user data
//   async verifyAppleToken(
//     idToken: string,
//     clientId: string
//   ): Promise<AppleUserData> {
//     try {
//       // Decode token header to get key ID
//       const decoded = jwt.decode(idToken, { complete: true });
//       if (!decoded) {
//         throw new Error('Invalid Apple ID token');
//       }

//       const { kid } = decoded.header;
//       const publicKey = await this.getApplePublicKey(kid);

//       // Verify token
//       const payload = jwt.verify(idToken, publicKey, {
//         algorithms: ['RS256'],
//         audience: clientId,
//         issuer: 'https://appleid.apple.com',
//       });

//       return {
//         provider: 'apple',
//         providerId: payload.sub,
//         email: payload.email,
//         emailVerified: payload.email_verified === 'true',
//         name: null, // Apple doesn't provide name in JWT, only during first auth
//         firstName: null,
//         lastName: null,
//         avatar: null,
//         isPrivateEmail: payload.is_private_email === 'true',
//         raw: payload,
//       };
//     } catch (error) {
//       throw new Error(`Apple token verification failed: ${error.message}`);
//     }
//   }

//   // Parse Apple user data from form submission (first-time auth)
//   parseAppleUserData(
//     identityToken: string,
//     user?: string | any
//   ): AppleUserData {
//     try {
//       const tokenData = await this.verifyAppleToken(
//         identityToken,
//         process.env.APPLE_CLIENT_ID as string
//       );

//       // User data is only provided on first authorization
//       let userData = {
//         provider: 'apple',
//         providerId: tokenData.providerId,
//         email: tokenData.email,
//         emailVerified: tokenData.emailVerified,
//         name: null,
//         firstName: null,
//         lastName: null,
//         avatar: null,
//         isPrivateEmail: tokenData.isPrivateEmail,
//         raw: { ...tokenData.raw },
//       };

//       // Parse user name if provided (only on first auth)
//       if (user) {
//         const userObj = typeof user === 'string' ? JSON.parse(user) : user;
//         if (userObj.name) {
//           userData.firstName = userObj.name.firstName;
//           userData.lastName = userObj.name.lastName;
//           userData.name =
//             `${userObj.name.firstName || ''} ${userObj.name.lastName || ''}`.trim();
//         }
//       }

//       return userData;
//     } catch (error) {
//       throw new Error(`Failed to parse Apple user data: ${error.message}`);
//     }
//   }
// }

// // WhatsApp Auth Data Retrieval
// class WhatsAppAuthProvider {
//   private client: twilio.Twilio;
//   private verifyServiceSid: string;

//   constructor(accountSid: string, authToken: string, verifyServiceSid: string) {
//     this.client = twilio(accountSid, authToken);
//     this.verifyServiceSid = verifyServiceSid;
//   }

//   // Send verification code via WhatsApp
//   async sendVerificationCode(phoneNumber: string) {
//     try {
//       const verification = await this.client.verify.v2
//         .services(this.verifyServiceSid)
//         .verifications.create({
//           to: phoneNumber,
//           channel: 'whatsapp',
//         });

//       return {
//         success: true,
//         sid: verification.sid,
//         status: verification.status,
//         to: verification.to,
//         channel: verification.channel,
//       };
//     } catch (error) {
//       throw new Error(`Failed to send WhatsApp verification: ${error.message}`);
//     }
//   }

//   // Verify the code and return user data
//   async verifyCodeAndGetUserData(
//     phoneNumber: string,
//     code: string
//   ): Promise<WhatsAppUserData> {
//     try {
//       const verificationCheck = await this.client.verify.v2
//         .services(this.verifyServiceSid)
//         .verificationChecks.create({
//           to: phoneNumber,
//           code: code,
//         });

//       if (verificationCheck.status !== 'approved') {
//         throw new Error('Invalid verification code');
//       }

//       // Format phone number for consistency
//       const formattedPhone = this.formatPhoneNumber(phoneNumber);

//       return {
//         provider: 'whatsapp',
//         providerId: formattedPhone,
//         phone: formattedPhone,
//         phoneVerified: true,
//         email: null,
//         name: null, // WhatsApp doesn't provide name
//         firstName: null,
//         lastName: null,
//         avatar: null,
//         verificationSid: verificationCheck.sid,
//         raw: verificationCheck,
//       };
//     } catch (error) {
//       throw new Error(`WhatsApp verification failed: ${error.message}`);
//     }
//   }

//   // Optional: Get WhatsApp profile info if you have WhatsApp Business API
//   async getWhatsAppProfile(phoneNumber: string, accessToken: string) {
//     try {
//       const response = await fetch(
//         `https://graph.facebook.com/v18.0/${phoneNumber}`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`WhatsApp API error: ${response.status}`);
//       }

//       const profileData = await response.json();

//       return {
//         provider: 'whatsapp',
//         providerId: phoneNumber,
//         phone: phoneNumber,
//         name: profileData.display_name || null,
//         avatar: profileData.profile_picture_url || null,
//         status: profileData.status || null,
//         raw: profileData,
//       };
//     } catch (error) {
//       throw new Error(`Failed to fetch WhatsApp profile: ${error.message}`);
//     }
//   }

//   // Utility function to format phone numbers consistently
//   formatPhoneNumber(phoneNumber: string): string {
//     // Remove all non-digit characters except +
//     let formatted = phoneNumber.replace(/[^\d+]/g, '');

//     // Ensure it starts with +
//     if (!formatted.startsWith('+')) {
//       formatted = '+' + formatted;
//     }

//     return formatted;
//   }
// }

// // Unified Auth Provider Manager
// class AuthProviderManager {
//   private google: GoogleAuthProvider;
//   private apple: AppleAuthProvider;
//   private whatsapp: WhatsAppAuthProvider;

//   constructor(config: AuthProviderConfig) {
//     this.google = new GoogleAuthProvider(config.google.clientId);
//     this.apple = new AppleAuthProvider();
//     this.whatsapp = new WhatsAppAuthProvider(
//       config.whatsapp.accountSid,
//       config.whatsapp.authToken,
//       config.whatsapp.verifyServiceSid
//     );
//   }

//   // Normalize user data from any provider
//   normalizeUserData(
//     providerData: GoogleUserData | AppleUserData | WhatsAppUserData
//   ): NormalizedUserData {
//     const baseData = {
//       provider: providerData.provider,
//       providerId: providerData.providerId,
//       email: providerData.email || null,
//       phone: providerData.phone || null,
//       name: providerData.name || 'User',
//       firstName: providerData.firstName || null,
//       lastName: providerData.lastName || null,
//       avatar: providerData.avatar || null,
//       emailVerified: providerData.emailVerified || false,
//       phoneVerified: providerData.phoneVerified || false,
//       metadata: providerData.raw || {},
//     };

//     // Provider-specific additions
//     switch (providerData.provider) {
//       case 'google':
//         baseData.locale = (providerData as GoogleUserData).locale;
//         break;
//       case 'apple':
//         baseData.isPrivateEmail = (
//           providerData as AppleUserData
//         ).isPrivateEmail;
//         break;
//       case 'whatsapp':
//         baseData.verificationSid = (
//           providerData as WhatsAppUserData
//         ).verificationSid;
//         break;
//     }

//     return baseData;
//   }

//   // Get user data based on provider and token/credentials
//   async getUserData(
//     provider: 'google',
//     credentials: GoogleCredentials
//   ): Promise<NormalizedUserData>;
//   async getUserData(
//     provider: 'apple',
//     credentials: AppleCredentials
//   ): Promise<NormalizedUserData>;
//   async getUserData(
//     provider: 'whatsapp',
//     credentials: WhatsAppCredentials
//   ): Promise<NormalizedUserData>;
//   async getUserData(
//     provider: 'google' | 'apple' | 'whatsapp',
//     credentials: GoogleCredentials | AppleCredentials | WhatsAppCredentials
//   ): Promise<NormalizedUserData> {
//     try {
//       let providerData: GoogleUserData | AppleUserData | WhatsAppUserData;

//       switch (provider) {
//         case 'google':
//           const googleCreds = credentials as GoogleCredentials;
//           if (googleCreds.idToken) {
//             providerData = await this.google.verifyGoogleToken(
//               googleCreds.idToken
//             );
//           } else if (googleCreds.accessToken) {
//             providerData = await this.google.getUserDataFromAccessToken(
//               googleCreds.accessToken
//             );
//           } else {
//             throw new Error(
//               'Google credentials missing: idToken or accessToken required'
//             );
//           }
//           break;

//         case 'apple':
//           const appleCreds = credentials as AppleCredentials;
//           if (appleCreds.idToken) {
//             providerData = await this.apple.verifyAppleToken(
//               appleCreds.idToken,
//               appleCreds.clientId
//             );
//           } else {
//             throw new Error('Apple credentials missing: idToken required');
//           }
//           break;

//         case 'whatsapp':
//           const whatsappCreds = credentials as WhatsAppCredentials;
//           if (whatsappCreds.phoneNumber && whatsappCreds.code) {
//             providerData = await this.whatsapp.verifyCodeAndGetUserData(
//               whatsappCreds.phoneNumber,
//               whatsappCreds.code
//             );
//           } else {
//             throw new Error(
//               'WhatsApp credentials missing: phoneNumber and code required'
//             );
//           }
//           break;

//         default:
//           throw new Error(`Unsupported provider: ${provider}`);
//       }

//       return this.normalizeUserData(providerData);
//     } catch (error) {
//       throw error;
//     }
//   }
// }

// // Export everything
// export {
//   GoogleAuthProvider,
//   AppleAuthProvider,
//   WhatsAppAuthProvider,
//   AuthProviderManager,
//   GoogleUserData,
//   AppleUserData,
//   WhatsAppUserData,
//   NormalizedUserData,
//   AuthProviderConfig,
//   GoogleCredentials,
//   AppleCredentials,
//   WhatsAppCredentials,
// };

// // Usage Examples:

// /*
// // Initialize the manager
// const authManager = new AuthProviderManager({
//   google: {
//     clientId: process.env.GOOGLE_CLIENT_ID!
//   },
//   whatsapp: {
//     accountSid: process.env.TWILIO_ACCOUNT_SID!,
//     authToken: process.env.TWILIO_AUTH_TOKEN!,
//     verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID!
//   }
// });

// // Get Google user data
// const googleUser = await authManager.getUserData('google', {
//   idToken: 'google_id_token_here'
// });

// // Get Apple user data
// const appleUser = await authManager.getUserData('apple', {
//   idToken: 'apple_id_token_here',
//   clientId: process.env.APPLE_CLIENT_ID!
// });

// // Get WhatsApp user data
// const whatsappUser = await authManager.getUserData('whatsapp', {
//   phoneNumber: '+1234567890',
//   code: '123456'
// });

// // All return normalized data structure:
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
// */
