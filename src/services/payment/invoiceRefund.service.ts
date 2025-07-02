import { refundInvoice } from '../../helpers/paymentGateway/methods';

export const invoiceRefund = async ({ invoiceId, Amount }: any) => {
  const result = await refundInvoice({ Key: invoiceId, Amount });
  return result;
};
