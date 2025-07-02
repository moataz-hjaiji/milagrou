export const environment = process.env.NODE_ENV || '';
export const port = process.env.PORT || '';
export const baseUrl = process.env.BASE_URL || '';

export const db = {
  uri: process.env.DB_URI || '',
  host: process.env.DB_HOST || '',
};

export const corsUrl = process.env.CORS_URL;

export const tokenInfo = {
  accessTokenValidityDays: parseInt(
    process.env.ACCESS_TOKEN_VALIDITY_DAYS || '0'
  ),
  refreshTokenValidityDays: parseInt(
    process.env.REFRESH_TOKEN_VALIDITY_DAYS || '0'
  ),
  issuer: process.env.TOKEN_ISSUER || '',
  audience: process.env.TOKEN_AUDIENCE || '',
};

export const logDirectory = process.env.LOG_DIR || '';

export const adminSeeder = {
  adminFirstName: process.env.ADMIN_FIRST_NAME || '',
  adminLastName: process.env.ADMIN_LAST_NAME || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPass: process.env.ADMIN_PASS || '',
  adminPhone: process.env.ADMIN_PHONE || '',
};

export const userSeeder = {
  userFirstName: process.env.USER_FIRST_NAME || '',
  userLastName: process.env.USER_LAST_NAME || '',
  userEmail: process.env.USER_EMAIL || '',
  userPass: process.env.USER_PASS || '',
  userPhone: process.env.USER_PHONE || '',
};

export const email = {
  smtpService: process.env.SMTP_SERVICE || '',
  smtpHost: process.env.EMAIL_HOST || '',
  smtpPort: process.env.EMAIL_PORT || '',
  smtpUser: process.env.EMAIL_USERNAME || '',
  smtpPass: process.env.EMAIL_PASSWORD || '',
};

export const phoneProvider = {
  url: process.env.SMS_URL,
  key: process.env.SMS_KEY,
  sender: process.env.SMS_SENDER,
  fct: process.env.SMS_FUNCTION,
};

export const NotificationConfig = {
  client_email: process.env.CLIENT_EMAIL,
  private_key: process.env.PRIVATE_KEY,
  project_id: process.env.PROJECT_ID,
};

export const twilioSettings = {
  accountSid: process.env.ACCOUNT_SID,
  authToken: process.env.AUTH_TOKEN,
  verifySid: process.env.VERIFY_SERVICE_SID,
  phoneNumber: process.env.PHONE_NUMBER,
};

export const myFatoorahSettings = {
  token: process.env.MY_FATOORAH_TOKEN,
  baseUrl: process.env.MY_FATOORAH_BASEURL,
};

export const authProviders = {
  googleClientId: process.env.GOOGLE_CLIENT_ID,
};
