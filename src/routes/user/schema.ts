import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    firstName: Joi.string().min(3).required(),
    lastName: Joi.string().min(3).required(),
    phoneNumber: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    verified: Joi.boolean().required(),
    roles: Joi.array().items(JoiObjectId()).required(),
  }),

  update: Joi.object().keys({
    firstName: Joi.string().min(3),
    lastName: Joi.string().min(3),
    email: Joi.string().email(),
    password: Joi.string().min(8),
    verified: Joi.boolean(),
    roles: Joi.array().items(JoiObjectId()),
  }),

  updateMe: Joi.object().keys({
    firstName: Joi.string().min(3),
    lastName: Joi.string().min(3),
  }),
};
