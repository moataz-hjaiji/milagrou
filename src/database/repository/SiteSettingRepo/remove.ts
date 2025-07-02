import { ObjectId } from 'mongoose';
import ISiteSetting, { SiteSettingModel } from '../../model/SiteSetting';

const remove = async (id: string | ObjectId): Promise<ISiteSetting | null> => {
  return await SiteSettingModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
