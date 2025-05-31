import RatingRepo from '../../database/repository/RatingRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const rating = await RatingRepo.findById(id, query);
  if (!rating) throw new BadRequestError('Rating not found');
  return rating;
};
