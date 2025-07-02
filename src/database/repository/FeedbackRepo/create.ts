import IFeedback, { FeedbackModel } from '../../model/Feedback';

const create = async (obj: Partial<IFeedback>): Promise<IFeedback> => {
  return await FeedbackModel.create(obj);
};

export default create;
