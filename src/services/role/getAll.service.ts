import RoleRepo from '../../database/repository/RoleRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const roles = await RoleRepo.findAll(options, query);
  const { docs, ...meta } = roles;

  return {
    meta,
    docs,
  };
};
