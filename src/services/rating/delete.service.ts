import RatingRepo from '../../database/repository/RatingRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const rating = await RatingRepo.remove(id);
  if (!rating) throw new BadRequestError('rating not found');
};
