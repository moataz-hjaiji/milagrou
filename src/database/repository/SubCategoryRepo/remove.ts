import { ObjectId } from 'mongoose';
import ISubCategory, { SubCategoryModel } from '../../model/SubCategory';

const remove = async (id: string | ObjectId): Promise<ISubCategory | null> => {
  return await SubCategoryModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
