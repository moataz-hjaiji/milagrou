import ProductRepo from '../../database/repository/ProductRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
  files?: Express.Request['files'];
}

export const update = async ({ id, body, files }: updateParams) => {
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

  const product = await ProductRepo.update(id, body);
  if (!product) throw new BadRequestError('product not found');
  return product;
};
