import { BadRequestError } from '../../core/ApiError';
import { ObjectId } from 'mongoose';
import CartRepo from '../../database/repository/CartRepo';

interface removeFromCartParams {
  userId: ObjectId;
  itemId: string;
}

export const removeFromCart = async ({
  userId,
  itemId,
}: removeFromCartParams) => {
  let cart = await CartRepo.findByObj({ userId });
  if (!cart) throw new BadRequestError('item doesnt exsist in your cart');

  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex !== -1) {
    cart.items.splice(itemIndex, 1);
  } else {
    throw new BadRequestError('item doesnt exsist in your cart');
  }

  await cart.save();
  return cart;
};
