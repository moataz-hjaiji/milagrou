import { ObjectId } from 'mongoose';
import IArea, { AreaModel } from '../../model/Area';

const remove = async (id: string | ObjectId): Promise<IArea | null> => {
  return await AreaModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
