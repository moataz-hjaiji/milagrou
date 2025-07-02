import Joi from '@hapi/joi';
import { JoiObjectId } from '../../helpers/utils/validator';

export default {
  param: Joi.object().keys({
    id: JoiObjectId().required(),
  }),

  InvoiceStatus: Joi.object().keys({
    invoiceId: Joi.string().required(),
  }),

  invoiceRefund: Joi.object().keys({
    invoiceId: Joi.string().required(),
    Amount: Joi.number().required(),
  }),

  getPaymentMethods: Joi.object().keys({
    InvoiceAmount: Joi.number().required(),
    CurrencyIso: Joi.string().required(),
  }),
};
