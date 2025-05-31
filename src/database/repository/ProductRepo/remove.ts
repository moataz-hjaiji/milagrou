import { ObjectId } from 'mongoose';
import IProduct, { ProductModel } from '../../model/Product';

const remove = async (id: string | ObjectId): Promise<IProduct | null> => {
  return await ProductModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
