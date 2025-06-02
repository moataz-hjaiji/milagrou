import RatingRepo from '../../database/repository/RatingRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const rating = await RatingRepo.update(id, body);
  if (!rating) throw new BadRequestError('rating not found');
  return rating;
};
