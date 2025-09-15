import { ObjectId } from 'mongoose';
import { ICartItem } from '../../database/model/Cart';
import CartRepo from '../../database/repository/CartRepo';

interface addToCartParams {
  userId: string;
  browserId: string;
  item: ICartItem;
}

export const addToCart = async ({
  userId,
  browserId,
  item,
}: addToCartParams) => {
  let cart: any;

  if (userId) {
    const cartCheck = await CartRepo.findByObj({ userId });
    if (!cartCheck) {
      cart = await CartRepo.create({ userId });
    } else {
      cart = cartCheck;
    }
  } else if (browserId) {
    const cartCheck = await CartRepo.findByObj({ browserId });
    if (!cartCheck) {
      cart = await CartRepo.create({ browserId });
    } else {
      cart = cartCheck;
    }
  }
  cart!.items.push(item);
  await cart.save();
  return cart;
};
