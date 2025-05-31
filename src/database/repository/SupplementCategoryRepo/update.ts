import { ObjectId } from 'mongoose';
import ISupplementCategory, {
  SupplementCategoryModel,
} from '../../model/SupplementCategory';

const update = async (
  id: string | ObjectId,
  obj: Partial<ISupplementCategory>
): Promise<ISupplementCategory | null> => {
  return await SupplementCategoryModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
