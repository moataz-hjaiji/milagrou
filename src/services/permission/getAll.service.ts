import PermissionRepo from '../../database/repository/PermissionRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const permissions = await PermissionRepo.findAll(options, query);
  const { docs, ...meta } = permissions;

  return {
    meta,
    docs,
  };
};
