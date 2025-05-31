import { ObjectId } from 'mongoose';
import ICategory, { CategoryModel } from '../../model/Category';

const remove = async (id: string | ObjectId): Promise<ICategory | null> => {
  return await CategoryModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
