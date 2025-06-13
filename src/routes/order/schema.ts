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
    deliveryType: Joi.string()
      .valid(DeliveryType.DELIVERY, DeliveryType.PICKUP)
      .required(),
    orderType: Joi.string()
      .valid(OrderType.GIFT, OrderType.RESERVATION, OrderType.NORMAL)
      .required(),
    addressId: JoiObjectId(),
    code: Joi.string(),
    reservationDate: Joi.date(),
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
      OrderStatus.DELIVERED,
      OrderStatus.SHIPPED,
      OrderStatus.PENDING,
      OrderStatus.ACCEPTED,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELED
    ),
  }),
};
