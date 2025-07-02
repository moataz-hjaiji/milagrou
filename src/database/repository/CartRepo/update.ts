import { ObjectId } from 'mongoose';
import ICart, { CartModel } from '../../model/Cart';

const update = async (
  id: string | ObjectId,
  obj: Partial<ICart>
): Promise<ICart | null> => {
  return await CartModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
