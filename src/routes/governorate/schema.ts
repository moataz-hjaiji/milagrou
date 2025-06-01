import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    name: Joi.string().required(),
  }),

  update: Joi.object().keys({
    name: Joi.string(),
  }),
};
