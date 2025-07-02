import AreaRepo from '../../database/repository/AreaRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const areas = await AreaRepo.findAll(options, query);
  const { docs, ...meta } = areas;

  return {
    meta,
    docs,
  };
};
