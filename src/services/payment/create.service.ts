import { BadRequestError } from '../../core/ApiError';
import { createInvoice } from '../../helpers/paymentGateway/createInvoice';

// interface createParams {
//   body: any;
//   files?: Express.Request['files'];
// }

export const create = async () =>
  // { body, files }: createParams
  {
    const result = await createInvoice();
    return result;
  };
