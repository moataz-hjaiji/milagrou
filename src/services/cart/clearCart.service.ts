import { BadRequestError } from '../../core/ApiError';
import { ObjectId } from 'mongoose';
import CartRepo from '../../database/repository/CartRepo';

interface removeFromCartParams {
  userId?: ObjectId;
  browserId: string;
}

export const clearCart = async ({
  userId,
  browserId,
}: removeFromCartParams) => {
  let cart: any;

  if (userId) {
    cart = await CartRepo.findByObj({ userId });
    if (!cart) throw new BadRequestError('item doesnt exsist in your cart');
  } else if (browserId) {
    cart = await CartRepo.findByObj({ browserId });
    if (!cart) throw new BadRequestError('item doesnt exsist in your cart');
  }

  cart.items = [];
  await cart.save();
  return cart;
};
