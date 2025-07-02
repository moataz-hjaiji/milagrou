import { PipelineStage } from 'mongoose';
import { AddressModel } from '../../model/Address';

const aggregate = async (obj: PipelineStage[]) => {
  return await AddressModel.aggregate(obj);
};

export default aggregate;
