import ProductRepo from '../../database/repository/ProductRepo';
import { BadRequestError } from '../../core/ApiError';
import { getMaxDiscountedPrice } from '../discount/getMaxDiscount';
import FavouriteRepo from '../../database/repository/FavouriteRepo';

export const getOne = async (id: string, query: any) => {
  let product: any = await ProductRepo.findById(id, query);
  if (!product) throw new BadRequestError('Product not found');
  const productObject = product.toObject();
  if (productObject.productPrice) {
    const priceAfterDiscount = await getMaxDiscountedPrice(productObject);
    productObject.productPrice.priceAfterDiscount = priceAfterDiscount;
  }

  return productObject;
};
