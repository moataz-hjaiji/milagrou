import SupplementCategoryRepo from '../../database/repository/SupplementCategoryRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const supplementCategory = await SupplementCategoryRepo.update(id, body);
  if (!supplementCategory)
    throw new BadRequestError('supplementCategory not found');
  return supplementCategory;
};
