import { PipelineStage } from 'mongoose';
import { GovernorateModel } from '../../model/Governorate';

const aggregate = async (obj: PipelineStage[]) => {
  return await GovernorateModel.aggregate(obj);
};

export default aggregate;
