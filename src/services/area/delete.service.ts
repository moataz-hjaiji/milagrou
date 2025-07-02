import AreaRepo from '../../database/repository/AreaRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const area = await AreaRepo.remove(id);
  if (!area) throw new BadRequestError('Area not found');
};
