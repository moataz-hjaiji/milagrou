import { ObjectId } from 'mongoose';
import IStore, { StoreModel } from '../../model/Store';

const remove = async (id: string | ObjectId): Promise<IStore | null> => {
  return await StoreModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
