import CategoryRepo from '../../database/repository/CategoryRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const categorys = await CategoryRepo.findAll(options, query);
  const { docs, ...meta } = categorys;

  return {
    meta,
    docs,
  };
};
