import Notification, { NotificationModel } from '../../model/Notification';

const update = async (
  condition: Record<string, any>,
  obj: Partial<Notification>
): Promise<any> => {
  return await NotificationModel.updateMany(
    condition,
    { $set: { ...obj } },
    { new: true }
  ).exec();
};

export default update;
