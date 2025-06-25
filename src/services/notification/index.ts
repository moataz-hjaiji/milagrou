import { getAll } from './getAll.service';
import { getOne } from './getOne.service';
import { update } from './update.service';
import { markAllAsSeen } from './markAllAsSeen.service';
import { subscribeToTopic } from './subscribeToTopic.service';
import { unsubscribeFromTopic } from './unsubscribeFromTopic.service';

export default {
  getAll,
  getOne,
  update,
  markAllAsSeen,
  subscribeToTopic,
  unsubscribeFromTopic,
};
