import { PipelineStage } from 'mongoose';
import { SiteSettingModel } from '../../model/SiteSetting';

const aggregate = async (obj: PipelineStage[]) => {
  return await SiteSettingModel.aggregate(obj);
};

export default aggregate;
