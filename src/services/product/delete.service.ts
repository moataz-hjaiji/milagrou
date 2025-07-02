import ProductRepo from '../../database/repository/ProductRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const product = await ProductRepo.remove(id);
  if (!product) throw new BadRequestError('Product not found');
};
