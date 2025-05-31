import { ObjectId } from 'mongoose';
import { BadRequestError } from '../../core/ApiError';
import PromoCodeRepo from '../../database/repository/PromoCodeRepo';
import CartRepo from '../../database/repository/CartRepo';
import { calculateItemPrices } from '../cart/calculateCartPrices';
import { DiscountType } from '../../database/model/Discount';

interface verifyPromoCodeParams {
  userId: ObjectId;
  code: string;
}

export const verifyPromoCode = async ({
  userId,
  code,
}: verifyPromoCodeParams) => {
  const cart = await CartRepo.findByObj({ userId });
  if (!cart) throw new BadRequestError('your cart is empty');

  const currentDate = new Date();

  const promoCode = await PromoCodeRepo.findByObj({
    $and: [
      { code },
      { isActive: true },
      { startDate: { $lte: currentDate } },
      { endDate: { $gte: currentDate } },
    ],
  });
  if (!promoCode) throw new BadRequestError('invalid promo code');

  if (promoCode.maxUsage && promoCode.actualUsage >= promoCode.maxUsage)
    throw new BadRequestError(`promo code reached it's max usage limit `);

  if (promoCode.oneTimeUse) {
    const exists = promoCode
      .users!.map((id) => id.toString())
      .includes(userId.toString());
    if (exists) throw new BadRequestError('you already used this promo code');
  }

  let totalCartPrice = 0;
  await cart.populate([
    {
      path: 'items.product',
      populate: [
        { path: 'productPrice', select: ' -createdAt -updatedAt' },
        {
          path: 'supplementArray.supplementCategory',
          select: '-description -createdAt -updatedAt',
        },
        {
          path: 'supplementArray.supplements.supplement',
          select: '-description -createdAt -updatedAt',
        },
        {
          path: 'subCategory',
          populate: [
            {
              path: 'category',
              populate: [
                { path: 'menu', select: '-description -createdAt -updatedAt' },
              ],
              select: '-description -createdAt -updatedAt',
            },
          ],
          select: '-description -createdAt -updatedAt',
        },
        {
          path: 'category',
          populate: [
            { path: 'menu', select: '-description -createdAt -updatedAt' },
          ],
          select: '-description -createdAt -updatedAt',
        },
      ],
      select: '-createdAt -updatedAt',
    },
    {
      path: 'items.selectedSupplements',
      populate: [
        {
          path: 'supplementCategory',
          select: '-description -createdAt -updatedAt',
        },
        {
          path: 'supplements.supplement',
          select: '-description -createdAt -updatedAt',
        },
      ],
    },
  ]);

  let result = await calculateItemPrices(cart.toObject());

  result.items.map((item: any) => {
    totalCartPrice += item.itemPrice.totalPrice;
  });

  let priceAfterPromoCode = totalCartPrice;
  if (promoCode.type === DiscountType.PERCENTAGE) {
    priceAfterPromoCode =
      totalCartPrice - (totalCartPrice * promoCode.amount) / 100;
  } else if (promoCode.type === DiscountType.AMOUNT) {
    priceAfterPromoCode = totalCartPrice - promoCode.amount;
  }

  priceAfterPromoCode = Math.max(0, priceAfterPromoCode);

  result.totalCartPrice = totalCartPrice;
  result.priceAfterPromoCode = priceAfterPromoCode;

  return result;
};
