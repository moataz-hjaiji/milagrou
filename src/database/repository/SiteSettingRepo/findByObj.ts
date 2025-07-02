import ISiteSetting, { SiteSettingModel } from '../../model/SiteSetting';

const findByObj = (obj: object): Promise<ISiteSetting | null> => {
  return SiteSettingModel.findOne(obj).exec();
};

export default findByObj;
