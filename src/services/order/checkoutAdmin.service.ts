import { ObjectId } from 'mongoose';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import CartRepo from '../../database/repository/CartRepo';
import OrderRepo from '../../database/repository/OrderRepo';
import { calculateOrderPrices } from './calculateOrderPrices';
import { DeliveryType } from '../../database/model/Order';
import PromoCodeRepo from '../../database/repository/PromoCodeRepo';
import { DiscountType } from '../../database/model/Discount';
import DeliveryPriceRepo from '../../database/repository/DeliveryPriceRepo';
import UserRepo from '../../database/repository/UserRepo';
import { createInvoice } from '../../helpers/paymentGateway/methods';

interface checkoutParams {
  cart: any;
  userId: ObjectId;
  deliveryType: string;
  orderType: string;
  reservationDate?: Date;
  addressId?: string;
  code?: string;
}

export const checkoutAdmin = async ({
  cart,
  userId,
  deliveryType,
  orderType,
  reservationDate,
  addressId,
  code,
}: checkoutParams) => {
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

  const user = await UserRepo.findById(userId);

  const paymentData = {
    NotificationOption: 'LNK',
    CustomerName: `${user?.firstName} ${user?.lastName}`,
    InvoiceValue: orderPrice,
  };

  const result = await createInvoice(paymentData);

  const order = await OrderRepo.create({
    userId,
    deliveryType,
    orderType,
    addressId,
    orderPrice,
    orderPriceWithoutDeliveryPrice,
    newId,
    promoCodeId: promoCode?._id,
    items,
    reservationDate,
    invoiceId: result.Data.InvoiceId,
    invoiceUrl: result.Data.InvoiceURL,
  } as any);

  if (promoCode) {
    ++promoCode.actualUsage;
    promoCode.users.push(userId);
    await promoCode.save();
  }

  return order;
};
