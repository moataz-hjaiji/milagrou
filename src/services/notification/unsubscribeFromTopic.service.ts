import { BadRequestError } from '../../core/ApiError';
import { firebase } from '../../helpers/notif/initializeApp';

export const unsubscribeFromTopic = async (token: string, topic: string) => {
  try {
    await firebase.messaging().unsubscribeFromTopic(token, topic);
  } catch (error) {
    throw new BadRequestError('error while unsubscribing to topic');
  }
};
