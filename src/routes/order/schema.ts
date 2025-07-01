import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';
import {
  DeliveryType,
  OrderStatus,
  OrderType,
  PaymentStatus,
} from '../../database/model/Order';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  checkout: Joi.object().keys({
    userId: JoiObjectId(),
    browserId: Joi.string(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    phoneNumber: Joi.string(),
    email: Joi.string(),
    note: Joi.string(),
    giftMsg: Joi.string(),
    deliveryType: Joi.string()
      .valid(DeliveryType.DELIVERY, DeliveryType.PICKUP)
      .required(),
    orderType: Joi.string()
      .valid(OrderType.GIFT, OrderType.RESERVATION, OrderType.NORMAL)
      .required(),
    addressId: JoiObjectId(),
    code: Joi.string(),
    reservationDate: Joi.date(),
    InvoicePaymentMethods: Joi.array().items(Joi.number()).required(),
  }),

  checkoutAdmin: Joi.object().keys({
    userId: JoiObjectId(),
    note: Joi.string(),
    InvoicePaymentMethods: Joi.array().items(Joi.number()).required(),
    giftMsg: Joi.string(),
    deliveryType: Joi.string()
      .valid(DeliveryType.DELIVERY, DeliveryType.PICKUP)
      .required(),
    orderType: Joi.string()
      .valid(OrderType.GIFT, OrderType.RESERVATION, OrderType.NORMAL)
      .required(),
    addressId: JoiObjectId(),
    code: Joi.string(),
    reservationDate: Joi.date(),
    cart: Joi.array()
      .items(
        Joi.object({
          product: Joi.object({
            _id: JoiObjectId().required(),
            nameAng: Joi.string().required(),
            nameAr: Joi.string().required(),
            descriptionAng: Joi.string().required(),
            descriptionAr: Joi.string().required(),
            price: Joi.number().required(),
            images: Joi.array().items(Joi.string()).required(),
          }).required(),
          supplements: Joi.array().items(
            Joi.object({
              _id: JoiObjectId().required(),
              nameAng: Joi.string().required(),
              nameAr: Joi.string().required(),
              price: Joi.number().required(),
            })
          ),
          quantity: Joi.number().required(),
        })
      )
      .required(),
  }),

  acceptOrder: Joi.object().keys({
    items: Joi.array()
      .items(
        Joi.object().keys({
          productId: JoiObjectId().required(),
          storeId: JoiObjectId().required(),
          quantity: Joi.number().integer().min(1).required(),
        })
      )
      .required(),
  }),

  update: Joi.object().keys({
    paymentStatus: Joi.string().valid(
      PaymentStatus.PAID,
      PaymentStatus.UNPAID,
      PaymentStatus.REFUNDED
    ),

    status: Joi.string().valid(
      OrderStatus.PENDING,
      OrderStatus.ACCEPTED,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELED
    ),
  }),
  exportData: Joi.object().keys({
    ids: Joi.array().items(Joi.string()),
  }),
};
