import CategoryRepo from '../../database/repository/CategoryRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const category = await CategoryRepo.update(id, body);
  if (!category) throw new BadRequestError('category not found');
  return category;
};
