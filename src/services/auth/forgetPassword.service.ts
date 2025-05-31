import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import crypto from 'crypto';
import {
  MessageSettings,
  sendTwilioMessage,
} from '../../helpers/utils/smsSender';

export const forgetPassword = async (phoneNumber: string) => {
  const userCheck = await UserRepo.findByObj({ phoneNumber });
  if (!userCheck) throw new NotFoundError('User not found');

  if (userCheck.forgetConfirmationCode)
    throw new BadRequestError('verification code already sent');

  const randomCode = crypto.randomInt(100001, 999999);

  const user = await UserRepo.update(userCheck.id, {
    forgetConfirmationCode: randomCode,
  });
  if (!user) throw new BadRequestError('error updating user');

  const message = `Your verification code is:${randomCode}`;

  const messageSettings: MessageSettings = {
    body: message,
    to: phoneNumber,
  };
  sendTwilioMessage(messageSettings);
};
