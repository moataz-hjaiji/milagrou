import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    name: Joi.string().trim().min(2).max(100).required(),
    permissions: Joi.array().items(JoiObjectId()).unique().min(1).required(),
  }),

  update: Joi.object().keys({
    name: Joi.string().trim().min(2).max(100),
    permissions: Joi.array().items(JoiObjectId()).unique().min(1),
  }),
};
