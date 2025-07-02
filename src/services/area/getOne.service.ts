import AreaRepo from '../../database/repository/AreaRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const area = await AreaRepo.findById(id, query);
  if (!area) throw new BadRequestError('Area not found');
  return area;
};
