import AreaRepo from '../../database/repository/AreaRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const area = await AreaRepo.update(id, body);
  if (!area) throw new BadRequestError('area not found');
  return area;
};
