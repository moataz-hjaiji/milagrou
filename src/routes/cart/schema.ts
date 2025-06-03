import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';
import { CartAction } from '../../database/model/Cart';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  addToCart: Joi.object().keys({
    product: JoiObjectId().required(),
    quantity: Joi.number().integer().min(1).required(),
    supplements: Joi.array().items(JoiObjectId()),
  }),

  incrementOrDecrement: Joi.object().keys({
    itemId: JoiObjectId().required(),
    action: Joi.string()
      .valid(...Object.values(CartAction))
      .required(),
  }),

  removeFromCart: Joi.object().keys({
    itemId: JoiObjectId().required(),
  }),

  editItem: Joi.object().keys({
    itemId: JoiObjectId().required(),
    item: Joi.object().keys({
      supplements: Joi.array().items(JoiObjectId()),
    }),
  }),
};
