import FeedbackRepo from '../../database/repository/FeedbackRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const feedback = await FeedbackRepo.update(id, body);
  if (!feedback) throw new BadRequestError('feedback not found');
  return feedback;
};
