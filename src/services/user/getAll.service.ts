import UserRepo from '../../database/repository/UserRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const users = await UserRepo.findAll(options, query);
  const { docs, ...meta } = users;

  return {
    meta,
    docs,
  };
};
