import CategoryRepo from '../../database/repository/CategoryRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const category = await CategoryRepo.findById(id, query);
  if (!category) throw new BadRequestError('Category not found');
  return category;
};
