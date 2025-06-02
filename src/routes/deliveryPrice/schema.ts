import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    price: Joi.number().required(),
    isActive: Joi.boolean(),
    freeDeliveryOption: Joi.boolean(),
    freeAfter: Joi.number().min(0),
  }),

  update: Joi.object().keys({
    price: Joi.number(),
    isActive: Joi.boolean(),
    freeDeliveryOption: Joi.boolean(),
    freeAfter: Joi.number().min(0),
  }),
};
