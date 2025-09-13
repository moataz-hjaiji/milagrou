import { BadRequestError } from '../../core/ApiError';
import { firebase } from '../../helpers/notif/initializeApp';

export const unsubscribeFromTopic = async (token: string, topic: string) => {
  try {
    if (!firebase) {
      console.log('Firebase not initialized, skipping topic unsubscription');
      return;
    }
    await firebase.messaging().unsubscribeFromTopic(token, topic);
  } catch (error) {
    throw new BadRequestError('error while unsubscribing to topic');
  }
};
