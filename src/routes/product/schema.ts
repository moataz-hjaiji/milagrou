import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object()
    .keys({
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
      isAvailable: Joi.boolean().required(),
      isRecommended: Joi.boolean().required(),
      subCategory: JoiObjectId(),
      category: JoiObjectId(),
      supplementArray: Joi.array().items(
        Joi.object({
          supplementCategory: JoiObjectId().required(),
          min: Joi.number().min(0).required(),
          max: Joi.number().min(Joi.ref('min')).required(),
          supplements: Joi.array()
            .items(
              Joi.object({
                supplement: JoiObjectId().required(),
                price: Joi.number().min(0).required(),
              })
            )
            .required(),
        })
      ),
    })
    .xor('subCategory', 'category'),

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
    isAvailable: Joi.boolean(),
    isRecommended: Joi.boolean(),
    subCategory: JoiObjectId(),
    category: JoiObjectId(),
    supplementArray: Joi.array().items(
      Joi.object({
        supplementCategory: JoiObjectId().required(),
        min: Joi.number().min(0).required(),
        max: Joi.number().min(Joi.ref('min')).required(),
        supplements: Joi.array()
          .items(
            Joi.object({
              supplement: JoiObjectId().required(),
              price: Joi.number().min(0).required(),
            })
          )
          .required(),
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
