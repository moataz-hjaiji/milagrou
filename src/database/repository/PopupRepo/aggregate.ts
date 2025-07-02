import { PipelineStage } from 'mongoose';
import { PopupModel } from '../../model/Popup';

const aggregate = async (obj: PipelineStage[]) => {
  return await PopupModel.aggregate(obj);
};

export default aggregate;
