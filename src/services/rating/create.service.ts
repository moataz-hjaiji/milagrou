import { ObjectId } from 'mongoose';
import { BadRequestError } from '../../core/ApiError';
import RatingRepo from '../../database/repository/RatingRepo';

interface createParams {
  body: any;
  userId: ObjectId;
}

export const create = async ({ body, userId }: createParams) => {
  const rating = await RatingRepo.create({ ...body, userId });
  if (!rating) throw new BadRequestError('error creating rating');
  return rating;
};
