import GovernorateRepo from '../../database/repository/GovernorateRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const governorate = await GovernorateRepo.remove(id);
  if (!governorate) throw new BadRequestError('Governorate not found');
};
