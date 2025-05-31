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
    selectedSupplements: Joi.array().items(
      Joi.object().keys({
        supplementCategory: JoiObjectId().required(),
        supplements: Joi.array()
          .items(
            Joi.object().keys({
              supplement: JoiObjectId().required(),
            })
          )
          .min(1)
          .required(),
      })
    ),
    notes: Joi.string(),
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
      selectedSupplements: Joi.array().items(
        Joi.object().keys({
          supplementCategory: JoiObjectId().required(),
          supplements: Joi.array()
            .items(
              Joi.object().keys({
                supplement: JoiObjectId().required(),
              })
            )
            .min(1)
            .required(),
        })
      ),
      notes: Joi.string(),
    }),
  }),
};
