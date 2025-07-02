import { ObjectId } from 'mongoose';
import IFeedback, { FeedbackModel } from '../../model/Feedback';

const remove = async (id: string | ObjectId): Promise<IFeedback | null> => {
  return await FeedbackModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
