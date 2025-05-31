import { PipelineStage } from 'mongoose';
import { OrderModel } from '../../model/Order';

const aggregate = async (obj: PipelineStage[]) => {
  return await OrderModel.aggregate(obj);
};

export default aggregate;
