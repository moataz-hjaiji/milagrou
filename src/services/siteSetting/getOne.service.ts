import SiteSettingRepo from '../../database/repository/SiteSettingRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const siteSetting = await SiteSettingRepo.findById(id, query);
  if (!siteSetting) throw new BadRequestError('SiteSetting not found');
  return siteSetting;
};
