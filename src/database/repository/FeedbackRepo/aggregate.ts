import { PipelineStage } from 'mongoose';
import { FeedbackModel } from '../../model/Feedback';

const aggregate = async (obj: PipelineStage[]) => {
  return await FeedbackModel.aggregate(obj);
};

export default aggregate;
