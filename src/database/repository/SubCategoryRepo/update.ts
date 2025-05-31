import { ObjectId } from 'mongoose';
import ISubCategory, { SubCategoryModel } from '../../model/SubCategory';

const update = async (
  id: string | ObjectId,
  obj: Partial<ISubCategory>
): Promise<ISubCategory | null> => {
  return await SubCategoryModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
