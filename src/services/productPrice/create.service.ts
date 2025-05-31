import { BadRequestError } from '../../core/ApiError';
import ProductPriceRepo from '../../database/repository/ProductPriceRepo';
import ProductRepo from '../../database/repository/ProductRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  const { product, isEnabled } = body;

  const checkProduct = await ProductRepo.findById(product);
  if (!checkProduct) throw new BadRequestError('invalid product id');

  if (isEnabled === true) {
    const checkProductPrice = await ProductPriceRepo.findByObj({
      isEnabled: true,
      product: product,
    });
    if (checkProductPrice)
      throw new BadRequestError('this product already has an enabled price');

    const productPrice = await ProductPriceRepo.create(body);
    const updateProduct = await ProductRepo.update(checkProduct.id, {
      productPrice: productPrice.id,
    });
    if (!productPrice || !updateProduct)
      throw new BadRequestError('error creating productPrice');
    return productPrice;
  } else {
    const productPrice = await ProductPriceRepo.create(body);
    if (!productPrice) throw new BadRequestError('error creating productPrice');
    return productPrice;
  }
};
