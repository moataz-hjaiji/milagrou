import NotificationRepo from '../../database/repository/NotificationRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const notifications = await NotificationRepo.findAll(options, query);
  const { docs, ...meta } = notifications;

  return {
    meta,
    docs,
  };
};
