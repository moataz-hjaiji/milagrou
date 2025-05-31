import { ObjectId } from 'mongoose';
import INotification, { NotificationModel } from '../../model/Notification';

const remove = async (id: string | ObjectId): Promise<INotification | null> => {
  return await NotificationModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
