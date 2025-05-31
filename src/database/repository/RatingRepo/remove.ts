import { ObjectId } from 'mongoose';
import IRating, { RatingModel } from '../../model/Rating';

const remove = async (id: string | ObjectId): Promise<IRating | null> => {
  return await RatingModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
