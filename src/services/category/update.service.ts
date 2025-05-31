import CategoryRepo from '../../database/repository/CategoryRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
  files?: Express.Request['files'];
}

export const update = async ({ id, body, files }: updateParams) => {
  if (files) {
    if ('picture' in files) {
      const picture = (
        files as {
          [fieldname: string]: Express.Multer.File[];
        }
      )['picture'];
      body.picture = picture[0].path;
    }
  }

  const category = await CategoryRepo.update(id, body);
  if (!category) throw new BadRequestError('category not found');
  return category;
};
