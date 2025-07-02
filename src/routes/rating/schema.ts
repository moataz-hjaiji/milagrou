import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    userId: JoiObjectId().required(),
    productId: JoiObjectId().required(),
    rating: Joi.number().min(1).max(5).multiple(1).required(),
    comment: Joi.string().required(),
  }),

  update: Joi.object().keys({
    isAccepted: Joi.boolean(),
  }),
};
