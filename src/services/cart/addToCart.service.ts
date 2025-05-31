import { ObjectId } from 'mongoose';
import { ICartItem } from '../../database/model/Cart';
import CartRepo from '../../database/repository/CartRepo';

interface addToCartParams {
  userId: ObjectId;
  item: ICartItem;
}

export const addToCart = async ({ userId, item }: addToCartParams) => {
  let cart;

  const cartCheck = await CartRepo.findByObj({ userId });
  if (!cartCheck) {
    cart = await CartRepo.create({ userId });
  } else {
    cart = cartCheck;
  }

  cart.items.push(item);
  await cart.save();
  return cart;
};
