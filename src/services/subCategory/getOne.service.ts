import SubCategoryRepo from '../../database/repository/SubCategoryRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const subCategory = await SubCategoryRepo.findById(id, query);
  if (!subCategory) throw new BadRequestError('SubCategory not found');
  return subCategory;
};
