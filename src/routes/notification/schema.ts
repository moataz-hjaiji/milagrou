import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
  update: Joi.object().keys({
    isRead: Joi.boolean(),
  }),
  subscribeOrUnsubscribe: Joi.object().keys({
    token: Joi.string().required(),
    topic: Joi.string().required(),
  }),
};
