import Joi from '@hapi/joi';
import { DiscountType } from '../../database/model/Discount';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  create: Joi.object().keys({
    code: Joi.string().min(3).required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    isActive: Joi.boolean().required(),
    oneTimeUse: Joi.boolean().required(),
    maxUsage: Joi.number().positive(),
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
    code: Joi.string().min(3),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    isActive: Joi.boolean(),
    oneTimeUse: Joi.boolean(),
    maxUsage: Joi.number().positive(),
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

  verifyPromoCode: Joi.object().keys({
    userId: JoiObjectId(),
    browserId: Joi.string(),
    code: Joi.string().min(3).required(),
  }),
};
