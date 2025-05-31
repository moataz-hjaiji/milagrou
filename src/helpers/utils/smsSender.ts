import axios from 'axios';
import { phoneProvider } from '../../configVars';
import { BadRequestError } from '../../core/ApiError';
import Logger from '../../core/Logger';

const date = new Date();
const hoursAndMinutes = date.getHours() + ':' + date.getMinutes();
const sms_key: string | undefined = phoneProvider.key;
const sms_sender: string | undefined = phoneProvider.sender;
const sms_function: string | undefined = phoneProvider.fct;
const sms_url: string | undefined = phoneProvider.url;
const sms_date: string = date.toLocaleDateString('fr-FR');
const sms_hour: string = hoursAndMinutes;
export const sendPhoneMessage = async (message: string, receiver: string) => {
  try {
    const response = await axios.get(`${sms_url}`, {
      params: {
        fct: sms_function,
        key: sms_key,
        mobile: `216${receiver}`,
        sms: message,
        sender: sms_sender,
        date: sms_date,
        heure: sms_hour,
      },
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      Logger.error('error message: ', error);
    } else {
      Logger.error('unexpected error: ', error);
    }
    throw new BadRequestError('error sending sms');
  }
};
