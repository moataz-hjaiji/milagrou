import MenuRepo from '../../database/repository/MenuRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
  file?: Express.Request['file'];
}

export const update = async ({ id, body, file }: updateParams) => {
  if (file) body.picture = file.path;
  const menu = await MenuRepo.update(id, body);
  if (!menu) throw new BadRequestError('menu not found');
  return menu;
};
