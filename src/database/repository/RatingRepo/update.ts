import { ObjectId } from 'mongoose';
import IRating, { RatingModel } from '../../model/Rating';

const update = async (
  id: string | ObjectId,
  obj: Partial<IRating>
): Promise<IRating | null> => {
  return await RatingModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
