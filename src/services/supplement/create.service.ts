import { BadRequestError } from '../../core/ApiError';
import SupplementRepo from '../../database/repository/SupplementRepo';

interface createParams {
  body: any;
  file?: Express.Request['file'];
}

export const create = async ({ body, file }: createParams) => {
  if (file) body.image = file.path;
  const supplement = await SupplementRepo.create(body);
  if (!supplement) throw new BadRequestError('error creating supplement');
  return supplement;
};
