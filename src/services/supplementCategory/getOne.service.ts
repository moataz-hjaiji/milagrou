import SupplementCategoryRepo from '../../database/repository/SupplementCategoryRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const supplementCategory = await SupplementCategoryRepo.findById(id, query);
  if (!supplementCategory)
    throw new BadRequestError('SupplementCategory not found');
  return supplementCategory;
};
