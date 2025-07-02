import { ObjectId } from 'mongoose';
import { BadRequestError } from '../../core/ApiError';
import FavouriteRepo from '../../database/repository/FavouriteRepo';
import ProductRepo from '../../database/repository/ProductRepo';

interface toggleParams {
  userId: ObjectId;
  productId: string;
}

export const toggle = async ({ userId, productId }: toggleParams) => {
  const product = await ProductRepo.findById(productId);
  if (!product) throw new BadRequestError('product not found');

  const favourite = await FavouriteRepo.findByObj({
    userId,
    product: productId,
  });

  if (!favourite) {
    await FavouriteRepo.create({ userId, product: productId });
    return true;
  } else {
    await FavouriteRepo.remove(favourite._id);
    return false;
  }
};
