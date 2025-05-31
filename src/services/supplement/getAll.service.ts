import SupplementRepo from '../../database/repository/SupplementRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const supplements = await SupplementRepo.findAll(options, query);
  const { docs, ...meta } = supplements;

  return {
    meta,
    docs,
  };
};
