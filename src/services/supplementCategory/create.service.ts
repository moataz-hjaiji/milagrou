import { BadRequestError } from '../../core/ApiError';
import SupplementCategoryRepo from '../../database/repository/SupplementCategoryRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  const supplementCategory = await SupplementCategoryRepo.create(body);
  if (!supplementCategory)
    throw new BadRequestError('error creating supplementCategory');
  return supplementCategory;
};
