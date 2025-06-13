import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  InvoiceStatus: Joi.object().keys({
    invoiceId: Joi.string().required(),
  }),
};
