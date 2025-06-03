import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    nameAng: Joi.string().required(),
    nameAr: Joi.string().required(),
  }),

  update: Joi.object().keys({
    nameAng: Joi.string(),
    nameAr: Joi.string(),
  }),
};
