import MenuRepo from '../../database/repository/MenuRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const menus = await MenuRepo.findAll(options, query);
  const { docs, ...meta } = menus;

  return {
    meta,
    docs,
  };
};
