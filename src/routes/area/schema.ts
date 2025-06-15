import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    deliveryPrice: Joi.number().required(),
    nameAng: Joi.string().required(),
    nameAr: Joi.string().required(),
    governorateId: JoiObjectId().required(),
  }),

  update: Joi.object().keys({
    deliveryPrice: Joi.number(),
    nameAng: Joi.string(),
    nameAr: Joi.string(),
    governorateId: JoiObjectId(),
  }),
};
