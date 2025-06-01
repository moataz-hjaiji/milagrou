import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    userId: JoiObjectId().required(),
    areaId: JoiObjectId().required(),
    block: Joi.string().required(),
    street: Joi.string().required(),
    buildingNumber: Joi.number(),
    specialDirection: Joi.string(),
  }),

  update: Joi.object().keys({
    userId: JoiObjectId(),
    areaId: JoiObjectId(),
    block: Joi.string(),
    street: Joi.string(),
    buildingNumber: Joi.number(),
    specialDirection: Joi.string(),
  }),
};
