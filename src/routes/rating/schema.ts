import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    orderId: JoiObjectId().required(),
    foodRating: Joi.number().min(1).max(5).multiple(1).required(),
    foodComment: Joi.string(),
    deliveryRating: Joi.number().min(1).max(5).multiple(1).required(),
    deliveryComment: Joi.string(),
  }),
};
