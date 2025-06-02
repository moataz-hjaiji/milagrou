import SupplementRepo from '../../database/repository/SupplementRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
  file?: Express.Request['file'];
}

export const update = async ({ id, body, file }: updateParams) => {
  if (file) body.image = file.path;
  const supplement = await SupplementRepo.update(id, body);
  if (!supplement) throw new BadRequestError('supplement not found');
  return supplement;
};
