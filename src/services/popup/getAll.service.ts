import PopupRepo from '../../database/repository/PopupRepo';

export const getAll = async (query: any) => {
  const { page, perPage, userId, browserId } = query;
  delete query.userId;
  delete query.browserId;

  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  let popups = await PopupRepo.findAll(options, query);

  if (userId) {
    await Promise.all(
      popups.docs.map(async (popup: any) => {
        const exists = popup
          .users!.map((id: any) => id.toString())
          .includes(userId);
        popup.isSeen = !!exists;
      })
    );
  } else if (browserId) {
    await Promise.all(
      popups.docs.map(async (popup: any) => {
        const exists = popup.browserIds.includes(browserId);
        popup.isSeen = !!exists;
      })
    );
  }

  const { docs, ...meta } = popups;

  return {
    meta,
    docs,
  };
};
