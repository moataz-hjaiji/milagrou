import { PipelineStage } from 'mongoose';
import { StoreModel } from '../../model/Store';

const aggregate = async (obj: PipelineStage[]) => {
  return await StoreModel.aggregate(obj);
};

export default aggregate;
