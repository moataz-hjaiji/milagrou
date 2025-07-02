import { BadRequestError } from '../../core/ApiError';
import RatingRepo from '../../database/repository/RatingRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  const rating = await RatingRepo.create(body);
  if (!rating) throw new BadRequestError('error creating rating');
  return rating;
};
