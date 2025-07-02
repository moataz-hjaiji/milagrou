import { ObjectId } from 'mongoose';
import IOrder, { OrderModel } from '../../model/Order';

const remove = async (id: string | ObjectId): Promise<IOrder | null> => {
  return await OrderModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
