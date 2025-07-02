import { ObjectId } from 'mongoose';
import IGovernorate, { GovernorateModel } from '../../model/Governorate';

const remove = async (id: string | ObjectId): Promise<IGovernorate | null> => {
  return await GovernorateModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
