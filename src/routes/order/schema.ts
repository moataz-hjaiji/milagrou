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
    deliveryType: Joi.string()
      .valid(DeliveryType.DELIVERY, DeliveryType.PICKUP)
      .required(),
    orderType: Joi.string()
      .valid(OrderType.GIFT, OrderType.RESERVATION, OrderType.NORMAL)
      .required(),
    paymentMethodId: JoiObjectId().required(),
    addressId: JoiObjectId(),
    code: Joi.string(),
    reservationDate: Joi.date(),
  }),

  update: Joi.object().keys({
    paymentStatus: Joi.string().valid(
      PaymentStatus.PAID,
      PaymentStatus.UNPAID,
      PaymentStatus.REFUNDED
    ),

    status: Joi.string().valid(
      OrderStatus.PENDING,
      OrderStatus.DELIVERED,
      OrderStatus.SHIPPED
    ),
  }),
};
