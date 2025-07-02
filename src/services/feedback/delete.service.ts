import FeedbackRepo from '../../database/repository/FeedbackRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const feedback = await FeedbackRepo.remove(id);
  if (!feedback) throw new BadRequestError('Feedback not found');
};
