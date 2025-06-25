import INotification, { NotificationModel } from '../../model/Notification';

const create = async (obj: Partial<INotification>): Promise<INotification> => {
  return await NotificationModel.create(obj);
};

export default create;
