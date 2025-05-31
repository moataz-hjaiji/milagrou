import ProductPriceRepo from '../../database/repository/ProductPriceRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const productPrice = await ProductPriceRepo.findById(id, query);
  if (!productPrice) throw new BadRequestError('ProductPrice not found');
  return productPrice;
};
