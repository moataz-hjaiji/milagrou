import { ObjectId } from 'mongoose';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import CartRepo from '../../database/repository/CartRepo';
import OrderRepo from '../../database/repository/OrderRepo';
import { calculateOrderPrices } from './calculateOrderPrices';
import { DeliveryType, OrderStatus } from '../../database/model/Order';
import PromoCodeRepo from '../../database/repository/PromoCodeRepo';
import { DiscountType } from '../../database/model/Discount';
import DeliveryPriceRepo from '../../database/repository/DeliveryPriceRepo';

interface checkoutParams {
  userId: ObjectId;
  browserId: string;
  deliveryType: string;
  orderType: string;
  reservationDate?: Date;
  paymentMethodId: string;
  addressId?: string;
  code?: string;
}

export const checkout = async ({
  userId,
  browserId,
  deliveryType,
  orderType,
  reservationDate,
  paymentMethodId,
  addressId,
  code,
}: checkoutParams) => {
  if (userId) {
    const cart: any = await CartRepo.findByObj({ userId });
    if (!cart || cart.items.length === 0)
      throw new BadRequestError('your cart is empty');
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
        if (exists)
          throw new BadRequestError('you already used this promo code');
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

    if (deliveryType === DeliveryType.DELIVERY) {
      const deliveryPrice = await DeliveryPriceRepo.findByObj({
        isActive: true,
      });
      if (!deliveryPrice) throw new NotFoundError('deliveryPrice not found');
      if (
        deliveryPrice.freeDeliveryOption === false ||
        (deliveryPrice.freeDeliveryOption === true &&
          deliveryPrice.freeAfter! <= orderPrice)
      )
        orderPrice += deliveryPrice.price;
    }

    const orderNewIdCheck = await OrderRepo.getLastNewId();

    let newId = 1;

    if (orderNewIdCheck?.newId) newId = orderNewIdCheck?.newId + 1;

    const order = await OrderRepo.create({
      userId,
      deliveryType,
      orderType,
      paymentMethodId,
      addressId,
      orderPrice,
      orderPriceWithoutDeliveryPrice,
      newId,
      promoCodeId: promoCode?._id,
      items,
      reservationDate,
    } as any);

    if (promoCode) {
      ++promoCode.actualUsage;
      promoCode.users.push(userId);
      await promoCode.save();
    }

    cart.items = [];
    await cart.save();

    return order;
  } else if (browserId) {
    const cart: any = await CartRepo.findByObj({ browserId });
    if (!cart || cart.items.length === 0)
      throw new BadRequestError('your cart is empty');
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

    if (deliveryType === DeliveryType.DELIVERY) {
      const deliveryPrice = await DeliveryPriceRepo.findByObj({
        isActive: true,
      });
      if (!deliveryPrice) throw new NotFoundError('deliveryPrice not found');
      if (
        deliveryPrice.freeDeliveryOption === false ||
        (deliveryPrice.freeDeliveryOption === true &&
          deliveryPrice.freeAfter! <= orderPrice)
      )
        orderPrice += deliveryPrice.price;
    }

    const orderNewIdCheck = await OrderRepo.getLastNewId();

    let newId = 1;

    if (orderNewIdCheck?.newId) newId = orderNewIdCheck?.newId + 1;

    const order = await OrderRepo.create({
      browserId,
      deliveryType,
      orderType,
      paymentMethodId,
      addressId,
      orderPrice,
      orderPriceWithoutDeliveryPrice,
      newId,
      promoCodeId: promoCode?._id,
      items,
      reservationDate,
    } as any);

    if (promoCode) {
      ++promoCode.actualUsage;
      await promoCode.save();
    }

    cart.items = [];
    await cart.save();

    return order;
  }
};
