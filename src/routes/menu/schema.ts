import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    nameFr: Joi.string()
      .min(3)
      .required()
      .pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/),
    nameAr: Joi.string()
      .min(3)
      .required()
      .pattern(/^[\u0600-\u06FF\s]+$/),
    descriptionFr: Joi.string()
      .min(3)
      .pattern(/^[a-zA-ZÀ-ÿ0-9\s'".,;:!?@#$%^&*()_+=\[\]{}|\\<>\/\n-]+$/),
    descriptionAr: Joi.string()
      .min(3)
      .pattern(/^[\u0600-\u06FF0-9\s'".,;:!؟@#$%^&*()_+=\[\]{}|\\<>\/\n-]+$/),
  }),

  update: Joi.object().keys({
    nameFr: Joi.string()
      .min(3)
      .pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/),
    nameAr: Joi.string()
      .min(3)
      .pattern(/^[\u0600-\u06FF\s]+$/),
    descriptionFr: Joi.string()
      .min(3)
      .pattern(/^[a-zA-ZÀ-ÿ0-9\s'".,;:!?@#$%^&*()_+=\[\]{}|\\<>\/\n-]+$/),
    descriptionAr: Joi.string()
      .min(3)
      .pattern(/^[\u0600-\u06FF0-9\s'".,;:!؟@#$%^&*()_+=\[\]{}|\\<>\/\n-]+$/),
  }),
};
