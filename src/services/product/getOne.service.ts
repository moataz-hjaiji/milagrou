import ProductRepo from '../../database/repository/ProductRepo';
import { BadRequestError } from '../../core/ApiError';
import { getMaxDiscountedPrice } from '../discount/getMaxDiscount';

export const getOne = async (id: string, query: any) => {
  let product = await ProductRepo.findById(id, query);
  if (!product) throw new BadRequestError('Product not found');
  await product.populate('category');
  const productObject = product.toObject();
  const priceAfterDiscount = await getMaxDiscountedPrice(productObject);
  productObject.priceAfterDiscount = priceAfterDiscount;
  return product;
};
