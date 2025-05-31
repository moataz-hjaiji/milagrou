import { BadRequestError } from '../../core/ApiError';
import CategoryRepo from '../../database/repository/CategoryRepo';

interface createParams {
  body: any;
  files?: Express.Request['files'];
}

export const create = async ({ body, files }: createParams) => {
  const checkCategory = await CategoryRepo.findByObj({
    $or: [{ nameAr: body.nameAr }, { nameFr: body.nameFr }],
  });
  if (checkCategory)
    throw new BadRequestError(
      'Category with that name (Arabic or French) already exists'
    );

  if (files) {
    if ('picture' in files) {
      const picture = (
        files as {
          [fieldname: string]: Express.Multer.File[];
        }
      )['picture'];
      body.picture = picture[0].path;
    }
  } else throw new BadRequestError('picture was not provided');

  const category = await CategoryRepo.create(body);
  if (!category) throw new BadRequestError('error creating category');
  return category;
};
