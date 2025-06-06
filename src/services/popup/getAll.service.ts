import PopupRepo from '../../database/repository/PopupRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const popups = await PopupRepo.findAll(options, query);
  const { docs, ...meta } = popups;

  return {
    meta,
    docs,
  };
};
