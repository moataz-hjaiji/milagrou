import SupplementRepo from '../../database/repository/SupplementRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const supplement = await SupplementRepo.findById(id, query);
  if (!supplement) throw new BadRequestError('Supplement not found');
  return supplement;
};
