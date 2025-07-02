import { getInvoiceStatus } from '../../helpers/paymentGateway/methods';

export const InvoiceStatus = async (invoiceId: string) => {
  const result = await getInvoiceStatus(invoiceId);
  return result;
};
