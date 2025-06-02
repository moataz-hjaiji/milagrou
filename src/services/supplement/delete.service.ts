import SupplementRepo from '../../database/repository/SupplementRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const supplement = await SupplementRepo.remove(id);
  if (!supplement) throw new BadRequestError('Supplement not found');
};
