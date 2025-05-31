import { BadRequestError } from '../../core/ApiError';
import SupplementRepo from '../../database/repository/SupplementRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  const supplement = await SupplementRepo.create(body);
  if (!supplement) throw new BadRequestError('error creating supplement');
  return supplement;
};
