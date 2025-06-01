import { BadRequestError } from '../../core/ApiError';
import CategoryRepo from '../../database/repository/CategoryRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  const category = await CategoryRepo.create(body);
  if (!category) throw new BadRequestError('error creating category');
  return category;
};
