import { ObjectId } from 'mongoose';
import ISiteSetting, { SiteSettingModel } from '../../model/SiteSetting';

const update = async (
  id: string | ObjectId,
  obj: Partial<ISiteSetting>
): Promise<ISiteSetting | null> => {
  return await SiteSettingModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
