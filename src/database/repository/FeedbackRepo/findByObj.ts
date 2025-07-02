import IFeedback, { FeedbackModel } from '../../model/Feedback';

const findByObj = (obj: object): Promise<IFeedback | null> => {
  return FeedbackModel.findOne(obj).exec();
};

export default findByObj;
