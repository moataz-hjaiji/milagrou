import PopupRepo from '../../database/repository/PopupRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
  file?: Express.Request['file'];
}

export const update = async ({ id, body, file }: updateParams) => {
  if (file) body.image = file.path;
  const popup = await PopupRepo.update(id, body);
  if (!popup) throw new BadRequestError('popup not found');
  return popup;
};
