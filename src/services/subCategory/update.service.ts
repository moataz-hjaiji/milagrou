import SubCategoryRepo from '../../database/repository/SubCategoryRepo';
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

  const subCategory = await SubCategoryRepo.update(id, body);
  if (!subCategory) throw new BadRequestError('subCategory not found');
  return subCategory;
};
