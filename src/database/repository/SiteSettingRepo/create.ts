import ISiteSetting, { SiteSettingModel } from '../../model/SiteSetting';

const create = async (obj: Partial<ISiteSetting>): Promise<ISiteSetting> => {
  return await SiteSettingModel.create(obj);
};

export default create;
