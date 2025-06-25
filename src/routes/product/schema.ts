import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    nameAng: Joi.string().required(),
    nameAr: Joi.string().required(),
    descriptionAng: Joi.string().min(3).required(),
    descriptionAr: Joi.string().min(3).required(),
    isRecommended: Joi.boolean().required(),
    isTopSeller: Joi.boolean().required(),
    price: Joi.number().required().min(0),
    position: Joi.number().integer().min(0),
    minSupp: Joi.number().integer().required(),
    maxSupp: Joi.number().integer().required(),
    category: JoiObjectId().required(),
    stores: Joi.array().items(
      Joi.object({
        store: JoiObjectId().required(),
        quantity: Joi.number().min(0).required(),
      })
    ),
    supplements: Joi.array().items(
      Joi.object({
        supplement: JoiObjectId().required(),
        price: Joi.number().min(0).required(),
      })
    ),
  }),

  update: Joi.object().keys({
    nameAng: Joi.string(),
    nameAr: Joi.string(),
    descriptionAng: Joi.string().min(3),
    descriptionAr: Joi.string().min(3),
    isRecommended: Joi.boolean(),
    isTopSeller: Joi.boolean(),
    price: Joi.number().min(0),
    position: Joi.number().integer().min(0),
    category: JoiObjectId(),
    stores: Joi.array().items(
      Joi.object({
        store: JoiObjectId(),
        quantity: Joi.number().min(0),
      })
    ),
    supplements: Joi.array().items(
      Joi.object({
        supplement: JoiObjectId(),
        price: Joi.number().min(0),
      })
    ),
  }),

  updatePosition: Joi.object().keys({
    updates: Joi.array()
      .items(
        Joi.object({
          id: JoiObjectId().required(),
          position: Joi.number().integer().min(1).required(),
        })
      )
      .min(1)
      .required(),
  }),
};
