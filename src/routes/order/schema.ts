import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';
import {
  DeliveryType,
  OrderStatus,
  PaymentStatus,
} from '../../database/model/Order';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  checkout: Joi.object().keys({
    deliveryType: Joi.string().valid(
      DeliveryType.DELIVERY,
      DeliveryType.PICKUP
    ),
    paymentMethodId: JoiObjectId().required(),
    addressId: JoiObjectId(),
    code: Joi.string(),
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
