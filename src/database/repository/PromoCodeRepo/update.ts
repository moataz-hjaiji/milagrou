import { ObjectId } from 'mongoose';
import IPromoCode, { PromoCodeModel } from '../../model/PromoCode';

const update = async (
  id: string | ObjectId,
  obj: Partial<IPromoCode>
): Promise<IPromoCode | null> => {
  return await PromoCodeModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
