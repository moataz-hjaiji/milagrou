import axios from 'axios';
import { myFatoorahSettings } from '../../configVars';

const token = myFatoorahSettings.token;
const baseURL = myFatoorahSettings.baseUrl;

export const createInvoice = async ({
  NotificationOption,
  CustomerName,
  InvoiceValue,
}: any) => {
  try {
    const url = baseURL + '/v2/SendPayment';

    const headers = {
      Accept: 'application/json',
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    };

    const data = {
      NotificationOption,
      CustomerName,
      InvoiceValue,
      // CallBackUrl: 'https://youtube.com',
      // ErrorUrl: 'https://google.com',
    };

    const result = await axios({
      method: 'post',
      url,
      data,
      headers,
    });

    return result.data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error);
  }
};

export const getInvoiceStatus = async (Key: string) => {
  try {
    const url = baseURL + '/v2/getPaymentStatus';

    const headers = {
      Accept: 'application/json',
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    };

    const data = {
      Key,
      KeyType: 'invoiceid',
    };

    const result = await axios({
      method: 'post',
      url,
      data,
      headers,
    });

    return result.data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error);
  }
};

export const refundInvoice = async ({ Key, Amount }: any) => {
  try {
    const url = baseURL + '/v2/MakeRefund';

    const headers = {
      Accept: 'application/json',
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    };

    const data = {
      Key,
      KeyType: 'invoiceid',
      Amount,
    };

    const result = await axios({
      method: 'post',
      url,
      data,
      headers,
    });

    return result.data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error);
  }
};
