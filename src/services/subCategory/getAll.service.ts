import SubCategoryRepo from '../../database/repository/SubCategoryRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const subCategorys = await SubCategoryRepo.findAll(options, query);
  const { docs, ...meta } = subCategorys;

  return {
    meta,
    docs,
  };
};
