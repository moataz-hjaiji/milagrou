import { BadRequestError } from '../../core/ApiError';
import FeedbackRepo from '../../database/repository/FeedbackRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  const feedback = await FeedbackRepo.create(body);
  if (!feedback) throw new BadRequestError('error creating feedback');
  return feedback;
};
