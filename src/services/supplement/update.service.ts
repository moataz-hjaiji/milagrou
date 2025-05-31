import SupplementRepo from '../../database/repository/SupplementRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const supplement = await SupplementRepo.update(id, body);
  if (!supplement) throw new BadRequestError('supplement not found');
  return supplement;
};
