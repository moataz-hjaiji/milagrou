import { ObjectId } from 'mongoose';
import IDiscount, { DiscountModel } from '../../model/Discount';

const update = async (
  id: string | ObjectId,
  obj: Partial<IDiscount>
): Promise<IDiscount | null> => {
  return await DiscountModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
