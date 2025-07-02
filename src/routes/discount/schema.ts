import Joi from '@hapi/joi';
import { DiscountType } from '../../database/model/Discount';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    target: Joi.object({
      categoryId: JoiObjectId(),
      productId: JoiObjectId(),
    })
      .or('categoryId', 'productId')
      .required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    isActive: Joi.boolean().required(),
    amount: Joi.number().positive().required(),
    type: Joi.string()
      .valid(...Object.values(DiscountType))
      .required()
      .custom((value, helpers) => {
        const { amount } = helpers.state.ancestors[0];
        if (value === DiscountType.PERCENTAGE && amount > 100) {
          return helpers.error('any.invalid');
        }
        return value;
      }, 'percentage validation'),
  }),

  update: Joi.object().keys({
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    isActive: Joi.boolean(),
    amount: Joi.number().positive(),
    type: Joi.string()
      .valid(...Object.values(DiscountType))
      .custom((value, helpers) => {
        const { amount } = helpers.state.ancestors[0];
        if (value === DiscountType.PERCENTAGE && amount > 100) {
          return helpers.error('any.invalid');
        }
        return value;
      }, 'percentage validation'),
  }),
};
