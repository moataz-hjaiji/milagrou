import DiscountRepo from '../../database/repository/DiscountRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const discounts = await DiscountRepo.findAll(options, query);
  const { docs, ...meta } = discounts;

  return {
    meta,
    docs,
  };
};
