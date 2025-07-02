import { BadRequestError } from '../../core/ApiError';
import AreaRepo from '../../database/repository/AreaRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  const area = await AreaRepo.create(body);
  if (!area) throw new BadRequestError('error creating area');
  return area;
};
