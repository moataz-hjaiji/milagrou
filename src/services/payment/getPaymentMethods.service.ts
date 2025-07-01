import { fetchPaymentMethods } from '../../helpers/paymentGateway/methods';

export const getPaymentMethods = async (
  InvoiceAmount: number,
  CurrencyIso: string
) => {
  const result = await fetchPaymentMethods({ InvoiceAmount, CurrencyIso });
  return result;
};
