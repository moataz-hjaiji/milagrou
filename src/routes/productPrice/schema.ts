import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    product: JoiObjectId().required(),
    price: Joi.number().positive().required(),
    isEnabled: Joi.boolean().required(),
  }),

  update: Joi.object().keys({
    isEnabled: Joi.boolean(),
  }),
};
