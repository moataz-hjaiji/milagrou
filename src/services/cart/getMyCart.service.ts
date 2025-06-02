import { ObjectId } from 'mongoose';
import CartRepo from '../../database/repository/CartRepo';
import { calculateItemPrices } from './calculateCartPrices';

export const getMyCart = async (userId: ObjectId) => {
  let cart;
  let totalCartPrice = 0;

  const cartCheck = await CartRepo.findByObj({ userId });
  if (!cartCheck) {
    cart = await CartRepo.create({ userId });
  } else {
    cart = cartCheck;
  }

  await cart.populate([
    {
      path: 'items.product.category', // Nested population for product->category
    },
    {
      path: 'items.supplements', // Separate population for supplements
    },
  ]);

  // await cart.populate([
  //   {
  //     path: 'items.product',
  //     populate: [
  //       { path: 'productPrice', select: ' -createdAt -updatedAt' },
  //       {
  //         path: 'supplementArray.supplementCategory',
  //         select: '-description -createdAt -updatedAt',
  //       },
  //       {
  //         path: 'supplementArray.supplements.supplement',
  //         select: '-description -createdAt -updatedAt',
  //       },
  //       {
  //         path: 'subCategory',
  //         populate: [
  //           {
  //             path: 'category',
  //             populate: [
  //               { path: 'menu', select: '-description -createdAt -updatedAt' },
  //             ],
  //             select: '-description -createdAt -updatedAt',
  //           },
  //         ],
  //         select: '-description -createdAt -updatedAt',
  //       },
  //       {
  //         path: 'category',
  //         populate: [
  //           { path: 'menu', select: '-description -createdAt -updatedAt' },
  //         ],
  //         select: '-description -createdAt -updatedAt',
  //       },
  //     ],
  //     select: '-createdAt -updatedAt',
  //   },
  //   {
  //     path: 'items.selectedSupplements',
  //     populate: [
  //       {
  //         path: 'supplementCategory',
  //         select: '-description -createdAt -updatedAt',
  //       },
  //       {
  //         path: 'supplements.supplement',
  //         select: '-description -createdAt -updatedAt',
  //       },
  //     ],
  //   },
  // ]);

  let result = await calculateItemPrices(cart.toObject());

  result.items.map((item: any) => {
    totalCartPrice += item.itemPrice.totalPrice;
  });

  result.totalCartPrice = totalCartPrice;

  return result;
};
