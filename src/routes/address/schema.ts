import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    userId: JoiObjectId().required(),
    street: Joi.string().required(),
    city: Joi.string().required(),
    location: Joi.object({
      type: Joi.string().valid('Point').required(),
      coordinates: Joi.array()
        .items(Joi.number().required())
        .length(2)
        .required(),
    }).required(),
    isHome: Joi.boolean(),
    isWork: Joi.boolean(),
  }),

  update: Joi.object().keys({
    userId: JoiObjectId(),
    street: Joi.string(),
    city: Joi.string(),
    location: Joi.object({
      type: Joi.string().valid('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2),
    }),
    isHome: Joi.boolean(),
    isWork: Joi.boolean(),
  }),

  lookup: Joi.object().keys({
    longitude: Joi.number().required(),
    latitude: Joi.number().required(),
    adressIds: Joi.array().items(JoiObjectId()).required(),
  }),
};
