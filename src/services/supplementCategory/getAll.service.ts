import SupplementCategoryRepo from '../../database/repository/SupplementCategoryRepo';
import SupplementRepo from '../../database/repository/SupplementRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  let supplementCategorys = await SupplementCategoryRepo.findAll(
    options,
    query
  );

  await Promise.all(
    supplementCategorys.docs.map(async (supplementCategory: any) => {
      const supplementCount = await SupplementRepo.count({
        supplementCategory: supplementCategory._id,
      });
      supplementCategory.supplementCount = supplementCount;
    })
  );

  const { docs, ...meta } = supplementCategorys;

  return {
    meta,
    docs,
  };
};
