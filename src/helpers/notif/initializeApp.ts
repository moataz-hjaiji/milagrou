import * as admin from 'firebase-admin';
import { NotificationConfig } from '../../configVars';

export const firebase = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: NotificationConfig.project_id,
    clientEmail: NotificationConfig.client_email,
    privateKey: NotificationConfig.private_key!.trim().replace(/\\n/g, '\n'),
  }),
});
