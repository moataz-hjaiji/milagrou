import { BadRequestError } from '../../core/ApiError';
import { firebase } from '../../helpers/notif/initializeApp';

export const subscribeToTopic = async (token: string, topic: string) => {
  try {
    if (!firebase) {
      console.log('Firebase not initialized, skipping topic subscription');
      return;
    }
    await firebase.messaging().subscribeToTopic(token, topic);
  } catch (error) {
    console.log(error);
    throw new BadRequestError('error while subscribing to topic');
  }
};
