import { ObjectId } from 'mongoose';
import ISupplementCategory, {
  SupplementCategoryModel,
} from '../../model/SupplementCategory';

const remove = async (
  id: string | ObjectId
): Promise<ISupplementCategory | null> => {
  return await SupplementCategoryModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
