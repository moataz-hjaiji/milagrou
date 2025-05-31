import { ObjectId } from 'mongoose';
import IMenu, { MenuModel } from '../../model/Menu';

const remove = async (id: string | ObjectId): Promise<IMenu | null> => {
  return await MenuModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
