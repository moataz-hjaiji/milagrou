import { BadRequestError } from '../../core/ApiError';
import PopupRepo from '../../database/repository/PopupRepo';

interface createParams {
  body: any;
  file?: Express.Request['file'];
}

export const create = async ({ body, file }: createParams) => {
  if (file) body.image = file.path;
  const popup = await PopupRepo.create(body);
  if (!popup) throw new BadRequestError('error creating popup');
  return popup;
};
