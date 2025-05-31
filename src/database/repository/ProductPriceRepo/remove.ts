import { ObjectId } from 'mongoose';
import IProductPrice, { ProductPriceModel } from '../../model/ProductPrice';

const remove = async (id: string | ObjectId): Promise<IProductPrice | null> => {
  return await ProductPriceModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
