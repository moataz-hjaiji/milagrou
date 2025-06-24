import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import RoleRepo from '../../database/repository/RoleRepo';

import crypto from 'crypto';
import {
  // MessageSettings,
  sendTwilioMessage,
} from '../../helpers/utils/smsSender';

export const registerPhone = async (phoneNumber: string) => {
  const userCheck = await UserRepo.findByObj({ phoneNumber });
  if (userCheck && userCheck.verified) {
    throw new BadRequestError('User with that phone number aleardy exists');
  } else if (userCheck && !userCheck.verified) {
    throw new BadRequestError(
      'Unverified User with that phone number aleardy exists'
    );
  }

  const roleUser = await RoleRepo.findByCode('user');
  if (!roleUser) throw new NotFoundError('user role not found');

  const randomCode = crypto.randomInt(100001, 999999);

  const user = await UserRepo.create({
    roles: [roleUser.id],
    phoneNumber,
    registerConfirmationCode: randomCode,
  });
  if (!user) throw new BadRequestError('error creating user');

  const message = `Your verification code is:${randomCode}`;

  // const messageSettings: MessageSettings = {
  //   body: message,
  //   to: phoneNumber,
  // };
  // sendTwilioMessage(messageSettings);
};
