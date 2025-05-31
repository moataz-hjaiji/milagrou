import CategoryRepo from '../../database/repository/CategoryRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const category = await CategoryRepo.remove(id);
  if (!category) throw new BadRequestError('Category not found');
};
