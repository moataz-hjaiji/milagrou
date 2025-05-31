import AddressRepo from '../../database/repository/AddressRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const addresss = await AddressRepo.findAll(options, query);
  const { docs, ...meta } = addresss;

  return {
    meta,
    docs,
  };
};
