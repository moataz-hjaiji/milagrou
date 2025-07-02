import GovernorateRepo from '../../database/repository/GovernorateRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const governorate = await GovernorateRepo.update(id, body);
  if (!governorate) throw new BadRequestError('governorate not found');
  return governorate;
};
