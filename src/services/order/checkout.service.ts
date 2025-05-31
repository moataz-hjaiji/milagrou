import { ObjectId } from 'mongoose';
import { BadRequestError, NotFoundError } from '../../core/ApiError';

import CartRepo from '../../database/repository/CartRepo';
import OrderRepo from '../../database/repository/OrderRepo';
import RoleRepo from '../../database/repository/RoleRepo';
import UserRepo from '../../database/repository/UserRepo';
import { sendNotifUser } from '../../helpers/notif';
import { calculateOrderPrices } from './calculateOrderPrices';
import { DeliveryType, OrderStatus } from '../../database/model/Order';
import PromoCodeRepo from '../../database/repository/PromoCodeRepo';
import { DiscountType } from '../../database/model/Discount';

interface checkoutParams {
  userId: ObjectId;
  deliveryType: string;
  paymentMethodId: string;
  addressId?: string;
  code?: string;
}

export const checkout = async ({
  userId,
  deliveryType,
  paymentMethodId,
  addressId,
  code,
}: checkoutParams) => {
  const cart: any = await CartRepo.findByObj({ userId });
  if (!cart || cart.items.length === 0)
    throw new BadRequestError('your cart is empty');
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

  const items = await calculateOrderPrices(cart.items.toObject());

  let orderPriceWithoutDeliveryPrice = items.reduce(
    (sum: any, item: any) => sum + item.itemPrice,
    0
  );

  let promoCode;

  if (code) {
    const currentDate = new Date();
    const promo = await PromoCodeRepo.findByObj({
      $and: [
        { code },
        { isActive: true },
        { startDate: { $lte: currentDate } },
        { endDate: { $gte: currentDate } },
      ],
    });
    if (!promo) throw new BadRequestError('invalid promo code');

    if (promo.maxUsage && promo.actualUsage >= promo.maxUsage)
      throw new BadRequestError(`promo code reached it's max usage limit `);

    if (promo.oneTimeUse) {
      const exists = promo
        .users!.map((id) => id.toString())
        .includes(userId.toString());
      if (exists) throw new BadRequestError('you already used this promo code');
    }

    if (promo.type === DiscountType.PERCENTAGE) {
      orderPriceWithoutDeliveryPrice =
        orderPriceWithoutDeliveryPrice -
        (orderPriceWithoutDeliveryPrice * promo.amount) / 100;
    } else if (promo.type === DiscountType.AMOUNT) {
      orderPriceWithoutDeliveryPrice =
        orderPriceWithoutDeliveryPrice - promo.amount;
    }
    orderPriceWithoutDeliveryPrice = Math.max(
      0,
      orderPriceWithoutDeliveryPrice
    );
    promoCode = promo;
  }

  let orderPrice = orderPriceWithoutDeliveryPrice;

  const orderNewIdCheck = await OrderRepo.getLastNewId();

  let newId = 1;

  if (orderNewIdCheck?.newId) newId = orderNewIdCheck?.newId + 1;

  const order = await OrderRepo.create({
    userId,
    deliveryType,
    paymentMethodId,
    addressId,
    status: OrderStatus.PENDING,
    items,
    orderPrice,
    orderPriceWithoutDeliveryPrice,
    newId,
    promoCodeId: promoCode?._id,
  } as any);

  if (promoCode) {
    ++promoCode.actualUsage;
    await promoCode.save();
  }

  cart.items = [];
  await cart.save();

  const roleAdmin = await RoleRepo.findByCode('admin');
  if (!roleAdmin) throw new NotFoundError('admin role not found');

  const admins = await UserRepo.findAllNotPaginated({
    roles: roleAdmin._id,
  });

  await Promise.all(
    admins.map(async (admin) => {
      await sendNotifUser(admin._id.toString(), {
        data: {
          title: 'Nouvelle commande',
          body: `Vous avez une nouvelle commande.`,
          orderId: order._id,
        },
      });
    })
  );

  return order;
};
