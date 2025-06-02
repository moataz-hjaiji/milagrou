import StoreRepo from '../../database/repository/StoreRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const stores = await StoreRepo.findAll(options, query);
  const { docs, ...meta } = stores;

  return {
    meta,
    docs,
  };
};
