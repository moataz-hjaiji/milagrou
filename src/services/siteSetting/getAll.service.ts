import SiteSettingRepo from '../../database/repository/SiteSettingRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const siteSettings = await SiteSettingRepo.findAll(options, query);
  const { docs, ...meta } = siteSettings;

  return {
    meta,
    docs,
  };
};
