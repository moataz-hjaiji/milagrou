import SiteSettingRepo from '../../database/repository/SiteSettingRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const siteSetting = await SiteSettingRepo.remove(id);
  if (!siteSetting) throw new BadRequestError('SiteSetting not found');
};
