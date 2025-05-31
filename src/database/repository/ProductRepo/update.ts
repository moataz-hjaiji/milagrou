import { ObjectId } from 'mongoose';
import IProduct, { ProductModel } from '../../model/Product';

const update = async (
  id: string | ObjectId,
  obj: Partial<IProduct>
): Promise<IProduct | null> => {
  return await ProductModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
