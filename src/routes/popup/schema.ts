import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    titleAng: Joi.string().required(),
    titleAr: Joi.string().required(),
    descriptionAng: Joi.string().required(),
    descriptionAr: Joi.string().required(),
    buttonTextAng: Joi.string().required(),
    buttonTextAr: Joi.string().required(),
    target: Joi.object({
      categoryId: JoiObjectId(),
      productId: JoiObjectId(),
    })
      .or('categoryId', 'productId')
      .required(),
    isActive: Joi.boolean().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
  }),

  update: Joi.object().keys({
    titleAng: Joi.string().required(),
    titleAr: Joi.string().required(),
    descriptionAng: Joi.string().required(),
    descriptionAr: Joi.string().required(),
    buttonTextAng: Joi.string().required(),
    buttonTextAr: Joi.string().required(),
    target: Joi.object({
      categoryId: JoiObjectId(),
      productId: JoiObjectId(),
    })
      .or('categoryId', 'productId')
      .required(),
    isActive: Joi.boolean().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
  }),
};
