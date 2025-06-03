import { BadRequestError } from '../../core/ApiError';
import ProductRepo from '../../database/repository/ProductRepo';

interface createParams {
  body: any;
  files?: Express.Request['files'];
}

export const create = async ({ body, files }: createParams) => {
  if (files) {
    if ('images' in files) {
      const images = (
        files as {
          [fieldname: string]: Express.Multer.File[];
        }
      )['images'];
      const imagesArray = images.map((file) => file.path);
      body.images = imagesArray;
    }
    if ('coverImage' in files) {
      const coverImage = (
        files as {
          [fieldname: string]: Express.Multer.File[];
        }
      )['coverImage'];
      body.coverImage = coverImage[0].path;
    }
  }

  const product = await ProductRepo.create(body);
  if (!product) throw new BadRequestError('error creating product');
  return product;
};
