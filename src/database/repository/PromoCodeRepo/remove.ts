import { ObjectId } from 'mongoose';
import IPromoCode, { PromoCodeModel } from '../../model/PromoCode';

const remove = async (id: string | ObjectId): Promise<IPromoCode | null> => {
  return await PromoCodeModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
