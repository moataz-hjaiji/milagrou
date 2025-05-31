import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import RoleRepo from '../../database/repository/RoleRepo';

import { generateKeys } from '../../helpers/utils/auth';
import KeystoreRepo from '../../database/repository/KeystoreRepo';
import { createTokens } from '../../authUtils/authUtils';
import { omit } from 'lodash';
import bcrypt from 'bcryptjs';

interface resetPasswordParams {
  phoneNumber: string;
  forgetConfirmationCode: number;
  password: string;
  confirmPassword: string;
}

export const resetPassword = async ({
  phoneNumber,
  forgetConfirmationCode,
  password,
  confirmPassword,
}: resetPasswordParams) => {
  const roleUser = await RoleRepo.findByCode('user');
  if (!roleUser) throw new NotFoundError('User role not found');

  const userCheck = await UserRepo.findByObj({
    phoneNumber,
    forgetConfirmationCode,
    roles: roleUser.id,
  });
  if (!userCheck) throw new BadRequestError('invalid verification code');

  if (password !== confirmPassword)
    throw new BadRequestError('password and confirm password do not match');

  const setUser = await UserRepo.update(userCheck.id, {
    forgetConfirmationCode: null,
    password: await bcrypt.hash(password, 12),
  });
  if (!setUser) throw new BadRequestError('error setting user password');

  const { accessTokenKey, refreshTokenKey } = generateKeys();
  await KeystoreRepo.create(setUser.id, accessTokenKey, refreshTokenKey);
  const [tokens] = await Promise.all([
    createTokens(setUser, accessTokenKey, refreshTokenKey),
    setUser,
  ]);

  const filteredUser = omit(setUser.toObject(), ['password']);

  return {
    tokens: tokens,
    user: filteredUser,
  };
};
