import { BadRequestError } from '../../core/ApiError';
import { ObjectId } from 'mongoose';
import CartRepo from '../../database/repository/CartRepo';

interface RemoveByProductParams {
  userId?: ObjectId;
  browserId?: string;
  productId: string;
}

export const removeByProduct = async ({
  userId,
  browserId,
  productId,
}: RemoveByProductParams) => {
  let cart: any;

  if (userId) {
    cart = await CartRepo.findByObj({ userId });
    if (!cart) throw new BadRequestError('item doesnt exsist in your cart');
  } else if (browserId) {
    cart = await CartRepo.findByObj({ browserId });
    if (!cart) throw new BadRequestError('item doesnt exsist in your cart');
  } else {
    throw new BadRequestError('userId or browserId is required');
  }
  console.log({cart});
  const index = cart.items.findIndex(
    (item: any) => item.product?.toString() === productId
  );

  if (index !== -1) {
    cart.items.splice(index, 1);
  } else {
    throw new BadRequestError('product doesnt exsist in your cart');
  }

  await cart.save();
  return cart;
};


