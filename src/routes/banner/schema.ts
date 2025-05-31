import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    titleFr: Joi.string().min(3).required(),
    titleAr: Joi.string().min(3).required(),
    descriptionAr: Joi.string()
      .min(3)
      .pattern(/^[\u0600-\u06FF0-9\s'".,;:!؟@#$%^&*()_+=\[\]{}|\\<>\/\n-]+$/),
    descriptionFr: Joi.string()
      .min(3)
      .pattern(/^[a-zA-ZÀ-ÿ0-9\s'".,;:!?@#$%^&*()_+=\[\]{}|\\<>\/\n-]+$/),
    isPublished: Joi.boolean(),
    data: Joi.object({
      menuId: JoiObjectId(),
      categoryId: JoiObjectId(),
      subCategoryId: JoiObjectId(),
      productId: JoiObjectId(),
    }),
  }),

  update: Joi.object().keys({
    titleFr: Joi.string().min(3),
    titleAr: Joi.string().min(3),
    descriptionAr: Joi.string()
      .min(3)
      .pattern(/^[\u0600-\u06FF0-9\s'".,;:!؟@#$%^&*()_+=\[\]{}|\\<>\/\n-]+$/),
    descriptionFr: Joi.string()
      .min(3)
      .pattern(/^[a-zA-ZÀ-ÿ0-9\s'".,;:!?@#$%^&*()_+=\[\]{}|\\<>\/\n-]+$/),
    isPublished: Joi.boolean(),
    data: Joi.object({
      menuId: JoiObjectId(),
      categoryId: JoiObjectId(),
      subCategoryId: JoiObjectId(),
      productId: JoiObjectId(),
    }),
  }),
};
