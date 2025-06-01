import { ObjectId } from 'mongoose';
import IGovernorate, { GovernorateModel } from '../../model/Governorate';

const update = async (
  id: string | ObjectId,
  obj: Partial<IGovernorate>
): Promise<IGovernorate | null> => {
  return await GovernorateModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
