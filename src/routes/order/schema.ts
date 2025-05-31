import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';
import { DeliveryType, OrderStatus } from '../../database/model/Order';

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
    deliveryGuyId: Joi.alternatives().try(JoiObjectId(), Joi.allow(null)),
    deliveryGuyacceptance: Joi.boolean(),
    status: Joi.string().valid(
      OrderStatus.ACCEPTED,
      OrderStatus.DELIVERED,
      OrderStatus.DELIVERING,
      OrderStatus.PREPARING,
      OrderStatus.PREPARED
    ),
  }),
};
