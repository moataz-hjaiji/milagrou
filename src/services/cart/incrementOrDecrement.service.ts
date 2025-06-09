import { BadRequestError } from '../../core/ApiError';
import { ObjectId } from 'mongoose';
import { CartAction } from '../../database/model/Cart';
import CartRepo from '../../database/repository/CartRepo';

interface incrementOrDecrementParams {
  userId: ObjectId;
  browserId: string;
  itemId: string;
  action: CartAction;
}

export const incrementOrDecrement = async ({
  userId,
  browserId,
  itemId,
  action,
}: incrementOrDecrementParams) => {
  let cart: any;

  if (userId) {
    cart = await CartRepo.findByObj({ userId });
    if (!cart) throw new BadRequestError('item doesnt exsist in your cart');
  } else if (browserId) {
    cart = await CartRepo.findByObj({ browserId });
    if (!cart) throw new BadRequestError('item doesnt exsist in your cart');
  }

  const itemIndex = cart.items.findIndex(
    (item: any) => item._id.toString() === itemId
  );

  if (itemIndex !== -1) {
    if (action === CartAction.PLUS) ++cart.items[itemIndex].quantity;
    if (action === CartAction.MINUS) --cart.items[itemIndex].quantity;
    if (cart.items[itemIndex].quantity <= 0) cart.items.splice(itemIndex, 1);
  } else {
    throw new BadRequestError('item doesnt exsist in your cart');
  }

  await cart.save();
  return cart;
};
