import { ObjectId } from 'mongoose';
import IStore, { StoreModel } from '../../model/Store';

const update = async (
  id: string | ObjectId,
  obj: Partial<IStore>
): Promise<IStore | null> => {
  return await StoreModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
