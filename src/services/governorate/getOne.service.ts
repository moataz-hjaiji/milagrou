import GovernorateRepo from '../../database/repository/GovernorateRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const governorate = await GovernorateRepo.findById(id, query);
  if (!governorate) throw new BadRequestError('Governorate not found');
  return governorate;
};
