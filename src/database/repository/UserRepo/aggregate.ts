import { PipelineStage } from 'mongoose';
import { UserModel } from '../../model/User';

const aggregate = async (obj: PipelineStage[]) => {
  return await UserModel.aggregate(obj);
};

export default aggregate;
