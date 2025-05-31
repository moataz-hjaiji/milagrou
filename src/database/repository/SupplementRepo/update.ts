import { ObjectId } from 'mongoose';
import ISupplement, { SupplementModel } from '../../model/Supplement';

const update = async (
  id: string | ObjectId,
  obj: Partial<ISupplement>
): Promise<ISupplement | null> => {
  return await SupplementModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
