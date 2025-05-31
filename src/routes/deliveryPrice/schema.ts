import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    price: Joi.number().min(0).max(100).required(),
    isActive: Joi.boolean().required(),
    freeDeliveryOption: Joi.boolean().required(),
    freeAfter: Joi.number().min(0),
  }),

  update: Joi.object().keys({
    isActive: Joi.boolean(),
    freeDeliveryOption: Joi.boolean(),
    freeAfter: Joi.number().min(0),
  }),
};
