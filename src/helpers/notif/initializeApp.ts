import * as admin from 'firebase-admin';
import { NotificationConfig } from '../../configVars';

// Only initialize Firebase if all required config is present
let firebase: admin.app.App | null = null;

if (NotificationConfig.project_id && 
    NotificationConfig.client_email && 
    NotificationConfig.private_key && 
    NotificationConfig.private_key !== '-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n') {
  try {
    firebase = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: NotificationConfig.project_id,
        clientEmail: NotificationConfig.client_email,
        privateKey: NotificationConfig.private_key.trim().replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.log('Firebase initialization skipped:', error);
  }
}

export { firebase };
