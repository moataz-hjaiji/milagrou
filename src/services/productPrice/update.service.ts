import ProductPriceRepo from '../../database/repository/ProductPriceRepo';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import ProductRepo from '../../database/repository/ProductRepo';
import { ObjectId } from 'mongoose';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const { isEnabled } = body;

  const productPrice = await ProductPriceRepo.findById(id);
  if (!productPrice) throw new NotFoundError('productPrice not found');

  if (isEnabled === true) {
    const checkProductPrice = await ProductPriceRepo.findByObj({
      isEnabled: true,
      product: productPrice.product,
    });
    if (checkProductPrice)
      throw new BadRequestError('this product already has an enabled price');

    const updateProductPrice = await ProductPriceRepo.update(id, body);
    const updateProduct = await ProductRepo.update(
      updateProductPrice!.product as ObjectId,
      {
        productPrice: updateProductPrice!._id,
      }
    );
    if (!updateProductPrice || !updateProduct)
      throw new BadRequestError('error creating productPrice');
    return updateProductPrice;
  } else if (isEnabled === false) {
    const updateProductPrice = await ProductPriceRepo.update(id, body);

    if (productPrice.isEnabled === true) {
      await ProductRepo.update(updateProductPrice!.product as ObjectId, {
        productPrice: undefined,
      });
    }

    if (!updateProductPrice)
      throw new BadRequestError('error updating productPrice');
    return updateProductPrice;
  } else {
    const productPrice = await ProductPriceRepo.update(id, body);
    if (!productPrice) throw new BadRequestError('productPrice not found');
    return productPrice;
  }
};
