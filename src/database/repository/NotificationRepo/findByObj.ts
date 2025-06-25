import INotification, { NotificationModel } from '../../model/Notification';

const findByObj = (obj: object): Promise<INotification | null> => {
  return NotificationModel.findOne(obj).exec();
};

export default findByObj;
