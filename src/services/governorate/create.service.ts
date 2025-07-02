import { BadRequestError } from '../../core/ApiError';
import GovernorateRepo from '../../database/repository/GovernorateRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  const governorate = await GovernorateRepo.create(body);
  if (!governorate) throw new BadRequestError('error creating governorate');
  return governorate;
};
