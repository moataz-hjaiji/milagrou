import axios from 'axios';

const token =
  'YbNpNxho6dzD2rlN-XCnplfWpemCr3uMvRwA84_SYBln3S7mbh6CIJiPeDjLbs840qfzZeod6zk_oJxQLHRm7MnPutXYGkjifO1YdvzZ3njMga1olsHJXZLQliS6iJyzn5n2szCLWcyW2ywc_PKBuYwjQWmUOh99DnaatRoJv8tF5nFAKBCGNcKgJin8mzSaj5fbmBzt1GPvI45xC5xYSHjnYgO3iklUT9wuKoC8csIJroTq0A9zCAzFgP6aGTvKHynZBUiDFSG7VOGZbwpUEk3M4JZYm8_33SLqKaO3hJmWrbcfQ65TyUrrVFI090Lb1JU_YlNlXnMcAbj3OQfBV_OR7pd4YD9OI6BTR2HqJV3gmEaWgiYSCjcTJ-712RgAMqPzpDDwDwMamjEJ1z-RUlxjGDWNQObgr-F1pBVwP7c9Prkx3tqk8pJGnbNeG81-EdQ0rbyiRzKwke_7a_NNkDYdZhr2I56dbcc2WMKvg4Mo92FT8VCj2NwsAuH2T-wMLz5B_1m9Xpm8sc60853wZUfIHywO4SS8X11UD-qvWyI-WwWi5X7m7gUf0KMJ_MABIHXbcX1jqYmSTzOEVWkB4mDNkkvv8CILpoafHZkxkAyP6W3MHXYzcSMaE4CetN0x9bfKHfHz4tEgxCO-iM4WTd3sdnrLnL4FxTVz9e3Hwd8rYWvU';

const baseURL = 'https://apitest.myfatoorah.com';

export const createInvoice = async () => {
  try {
    const headers = {
      Accept: 'application/json',
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    };

    const payload = {
      //   NotificationOption: 'LNK',
      //   CustomerName: 'Ahmed',
      //   InvoiceValue: 100,
      //   CallBackUrl: 'https://google.com',
      //   ErrorUrl: 'https://google.com',
      //   Language: 'en',
    };

    const result = await axios({
      method: 'post',
      url: baseURL + '/v2/SendPayment',
      data: payload,
      headers,
    });
    return result;
  } catch (error: any) {
    throw new Error(error);
    console.log(error.response);
  }
};

// var options = {
//   method: 'POST',
//   url: baseURL + '/v2/SendPayment',
//   headers: {
//     Accept: 'application/json',
//     Authorization: 'Bearer ' + token,
//     'Content-Type': 'application/json',
//   },
//   body: {
//     NotificationOption: 'ALL',
//     CustomerName: 'Ahmed',
//     DisplayCurrencyIso: 'KWD',
//     MobileCountryCode: '+965',
//     CustomerMobile: '12345678',
//     CustomerEmail: 'xx@yy.com',
//     InvoiceValue: 100,
//     CallBackUrl: 'https://google.com',
//     ErrorUrl: 'https://google.com',
//     Language: 'en',
//     CustomerReference: 'ref 1',
//     CustomerCivilId: 12345678,
//     UserDefinedField: 'Custom field',
//     ExpireDate: '',
//     CustomerAddress: {
//       Block: '',
//       Street: '',
//       HouseBuildingNo: '',
//       Address: '',
//       AddressInstructions: '',
//     },
//     InvoiceItems: [{ ItemName: 'Product 01', Quantity: 1, UnitPrice: 100 }],
//   },
//   json: true,
// };
