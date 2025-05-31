import { ObjectId } from 'mongoose';
import IProductPrice, { ProductPriceModel } from '../../model/ProductPrice';

const update = async (
  id: string | ObjectId,
  obj: Partial<IProductPrice>
): Promise<IProductPrice | null> => {
  return await ProductPriceModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
