import { BadRequestError } from '../../core/ApiError';
import { ObjectId } from 'mongoose';
import { ICartItem } from '../../database/model/Cart';
import CartRepo from '../../database/repository/CartRepo';

interface editItemParams {
  userId: ObjectId;
  browserId: string;
  itemId: string;
  item: ICartItem;
}

export const editItem = async ({
  userId,
  browserId,
  itemId,
  item,
}: editItemParams) => {
  let cart: any;
  if (userId) {
    cart = await CartRepo.findByObj({ userId });
  } else if (browserId) {
    cart = await CartRepo.findByObj({ browserId });
  }

  if (!cart) throw new BadRequestError('item doesnt exsist in your cart');

  const itemIndex = cart.items.findIndex(
    (item: any) => item._id.toString() === itemId
  );

  if (itemIndex !== -1) {
    cart.items[itemIndex] = {
      ...cart.items[itemIndex].toObject(),
      ...item,
    };
  } else {
    throw new BadRequestError('item doesnt exsist in your cart');
  }
  await cart.save();
  return cart;
};
