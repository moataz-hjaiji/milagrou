import PromoCodeRepo from '../../database/repository/PromoCodeRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const promoCodes = await PromoCodeRepo.findAll(options, query);
  const { docs, ...meta } = promoCodes;

  return {
    meta,
    docs,
  };
};
