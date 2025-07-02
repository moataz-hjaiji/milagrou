import { ObjectId } from 'mongoose';
import ISupplement, { SupplementModel } from '../../model/Supplement';

const remove = async (id: string | ObjectId): Promise<ISupplement | null> => {
  return await SupplementModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
