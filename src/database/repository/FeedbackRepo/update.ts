import { ObjectId } from 'mongoose';
import IFeedback, { FeedbackModel } from '../../model/Feedback';

const update = async (
  id: string | ObjectId,
  obj: Partial<IFeedback>
): Promise<IFeedback | null> => {
  return await FeedbackModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
