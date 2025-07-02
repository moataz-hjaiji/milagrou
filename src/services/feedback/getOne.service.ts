import FeedbackRepo from '../../database/repository/FeedbackRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const feedback = await FeedbackRepo.findById(id, query);
  if (!feedback) throw new BadRequestError('Feedback not found');
  return feedback;
};
