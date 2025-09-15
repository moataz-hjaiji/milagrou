import { ObjectId } from 'mongoose';
import CartRepo from '../../database/repository/CartRepo';
import { calculateItemPrices } from './calculateCartPrices';

interface getMyCartParams {
  userId: string;
  browserId: string;
}

export const getMyCart = async ({ userId, browserId }: getMyCartParams) => {
  let cart: any;
  let totalCartPrice = 0;

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

  await cart.populate([
    {
      path: 'items.product',
      populate: [
        {
          path: 'category',
          select: '-createdAt -updatedAt',
        },
        {
          path: 'supplements.supplement',
          select: '-createdAt -updatedAt',
        },
      ],
      select: '-createdAt -updatedAt',
    },
    {
      path: 'items.supplements',
      select: '-createdAt -updatedAt',
    },
  ]);

  let result = await calculateItemPrices(cart.toObject());

  result.items.map((item: any) => {
    totalCartPrice += item.itemPrice.totalPrice;
  });

  result.totalCartPrice = totalCartPrice;

  return result;
};
