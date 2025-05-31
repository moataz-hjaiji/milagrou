import RatingRepo from '../../database/repository/RatingRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const ratings = await RatingRepo.findAll(options, query);
  const { docs, ...meta } = ratings;

  return {
    meta,
    docs,
  };
};
