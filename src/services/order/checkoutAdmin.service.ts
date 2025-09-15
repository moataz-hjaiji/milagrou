import { ObjectId } from 'mongoose';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import CartRepo from '../../database/repository/CartRepo';
import OrderRepo from '../../database/repository/OrderRepo';
import { calculateOrderPrices } from './calculateOrderPrices';
import { DeliveryType } from '../../database/model/Order';
import PromoCodeRepo from '../../database/repository/PromoCodeRepo';
import { DiscountType } from '../../database/model/Discount';
import UserRepo from '../../database/repository/UserRepo';
import { createInvoice } from '../../helpers/paymentGateway/methods';
import AddressRepo from '../../database/repository/AddressRepo';
import IArea from '../../database/model/Area';

interface checkoutParams {
  cart: any;
  userId: ObjectId;
  deliveryType: string;
  orderType: string;
  reservationDate?: Date;
  addressId?: string;
  code?: string;
  note: string;
  giftMsg: string;
  InvoicePaymentMethods: number[];
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export const checkoutAdmin = async ({
  cart,
  userId,
  deliveryType,
  orderType,
  reservationDate,
  addressId,
  code,
  note,
  giftMsg,
  InvoicePaymentMethods,
  firstName,
  lastName,
  email,
  phoneNumber,
}: checkoutParams) => {
  const items = await calculateOrderPrices(cart, false);

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
      Number(orderPriceWithoutDeliveryPrice.toFixed(3))
    );
    promoCode = promo;
  }

  let orderPrice = orderPriceWithoutDeliveryPrice;

  // if (deliveryType === DeliveryType.DELIVERY) {
  //   const address = await AddressRepo.findById(addressId!, {
  //     populate: 'areaId',
  //   });
  //   if (!address) throw new NotFoundError('address not found');
  //   orderPrice += (address.areaId as IArea).deliveryPrice;
  // }

  const orderNewIdCheck = await OrderRepo.getLastNewId();

  let newId = 1;

  if (orderNewIdCheck?.newId) newId = orderNewIdCheck?.newId + 1;

  const user = await UserRepo.findById(userId);

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
    note,
    giftMsg,
    firstName,
    lastName,
    email,
    phoneNumber,
  } as any);

  const paymentData = {
    NotificationOption: 'LNK',
    CustomerName: `${firstName} ${lastName}`,
    InvoiceValue: orderPrice,
    InvoicePaymentMethods,
    orderId: order._id.toString(),
  };

  const paymentResult = await createInvoice(paymentData);

  order.invoiceId = paymentResult.Data.InvoiceId;
  order.invoiceUrl = paymentResult.Data.InvoiceURL;

  await order.save();

  if (promoCode) {
    ++promoCode.actualUsage;
    promoCode.users.push(userId);
    await promoCode.save();
  }

  await calculateOrderPrices(cart, true);

  return order;
};
