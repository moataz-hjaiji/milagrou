import { ObjectId } from 'mongoose';
import ICart, { CartModel } from '../../model/Cart';

const remove = async (id: string | ObjectId): Promise<ICart | null> => {
  return await CartModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
