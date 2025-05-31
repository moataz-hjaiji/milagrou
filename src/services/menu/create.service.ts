import { BadRequestError } from '../../core/ApiError';
import MenuRepo from '../../database/repository/MenuRepo';

interface createParams {
  body: any;
  file?: Express.Request['file'];
}

export const create = async ({ body, file }: createParams) => {
  if (file) body.picture = file.path;
  const menu = await MenuRepo.create(body);
  if (!menu) throw new BadRequestError('error creating menu');
  return menu;
};
