import SupplementCategoryRepo from '../../database/repository/SupplementCategoryRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const supplementCategory = await SupplementCategoryRepo.remove(id);
  if (!supplementCategory)
    throw new BadRequestError('SupplementCategory not found');
};
