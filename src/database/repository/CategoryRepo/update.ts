import { ObjectId } from 'mongoose';
import ICategory, { CategoryModel } from '../../model/Category';

const update = async (
  id: string | ObjectId,
  obj: Partial<ICategory>
): Promise<ICategory | null> => {
  return await CategoryModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
