import ProductPriceRepo from '../../database/repository/ProductPriceRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const productPrice = await ProductPriceRepo.remove(id);
  if (!productPrice) throw new BadRequestError('ProductPrice not found');
};
