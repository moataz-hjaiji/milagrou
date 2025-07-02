import { ObjectId } from 'mongoose';
import INotification, { NotificationModel } from '../../model/Notification';

const update = async (
  id: string | ObjectId,
  obj: Partial<INotification>
): Promise<INotification | null> => {
  return await NotificationModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
