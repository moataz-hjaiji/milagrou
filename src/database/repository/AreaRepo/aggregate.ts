import { PipelineStage } from 'mongoose';
import { AreaModel } from '../../model/Area';

const aggregate = async (obj: PipelineStage[]) => {
  return await AreaModel.aggregate(obj);
};

export default aggregate;
