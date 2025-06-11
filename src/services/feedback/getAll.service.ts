import FeedbackRepo from '../../database/repository/FeedbackRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const feedbacks = await FeedbackRepo.findAll(options, query);
  const { docs, ...meta } = feedbacks;

  return {
    meta,
    docs,
  };
};
