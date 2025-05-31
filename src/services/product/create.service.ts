import { BadRequestError } from '../../core/ApiError';
import ProductRepo from '../../database/repository/ProductRepo';

interface createParams {
  body: any;
  files?: Express.Request['files'];
}

export const create = async ({ body, files }: createParams) => {
  const checkProduct = await ProductRepo.findByObj({
    $or: [{ nameAr: body.nameAr }, { nameFr: body.nameFr }],
  });

  if (checkProduct)
    throw new BadRequestError(
      'Product with that name (Arabic or French) already exists'
    );

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
  } else throw new BadRequestError('images were not provided');

  const product = await ProductRepo.create(body);
  if (!product) throw new BadRequestError('error creating product');
  return product;
};
