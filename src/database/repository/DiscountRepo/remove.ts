import { ObjectId } from 'mongoose';
import IDiscount, { DiscountModel } from '../../model/Discount';

const remove = async (id: string | ObjectId): Promise<IDiscount | null> => {
  return await DiscountModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
