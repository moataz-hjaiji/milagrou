import { BadRequestError } from '../../core/ApiError';
import CategoryRepo from '../../database/repository/CategoryRepo';
import SubCategoryRepo from '../../database/repository/SubCategoryRepo';

interface createParams {
  body: any;
  files?: Express.Request['files'];
}

export const create = async ({ body, files }: createParams) => {
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

  const subCategory = await SubCategoryRepo.create(body);
  if (!subCategory) throw new BadRequestError('error creating subCategory');

  await CategoryRepo.update(body.category, {
    hasNoSubCategory: false,
  });

  return subCategory;
};
