import ProductRepo from '../../database/repository/ProductRepo';
import { BadRequestError } from '../../core/ApiError';

export const updatePosition = async (body: any) => {
  const product = await ProductRepo.bulkWrite(body.updates);
  if (!product) throw new BadRequestError('product not found');
};
