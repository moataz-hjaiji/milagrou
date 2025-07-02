import { ObjectId } from 'mongoose';
import IOrder, { OrderModel } from '../../model/Order';

const update = async (
  id: string | ObjectId,
  obj: Partial<IOrder>
): Promise<IOrder | null> => {
  return await OrderModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
