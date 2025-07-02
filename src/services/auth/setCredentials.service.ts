import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import RoleRepo from '../../database/repository/RoleRepo';

import { generateKeys } from '../../helpers/utils/auth';
import KeystoreRepo from '../../database/repository/KeystoreRepo';
import { createTokens } from '../../authUtils/authUtils';
import { omit } from 'lodash';
import bcrypt from 'bcryptjs';

interface SetCredentialsParams {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  confirmPassword: string;
  registerConfirmationCode?: number;
}

export const setCredentials = async ({
  phoneNumber,
  registerConfirmationCode,
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
}: SetCredentialsParams) => {
  const roleUser = await RoleRepo.findByCode('user');
  if (!roleUser) throw new NotFoundError('ser role not found');

  const userCheck = await UserRepo.findByObj({
    phoneNumber,
    registerConfirmationCode,
    roles: roleUser.id,
    verified: false,
  });
  if (!userCheck) throw new BadRequestError('invalid verification code');

  if (password !== confirmPassword)
    throw new BadRequestError('password and confirm password do not match');

  const emailCheck = await UserRepo.findByObj({ email });
  if (emailCheck)
    throw new BadRequestError('user with that email aleardy exists');

  const setUser = await UserRepo.update(userCheck.id, {
    firstName,
    lastName,
    email,
    verified: true,
    registerConfirmationCode: null,
    password: await bcrypt.hash(password, 12),
  });
  if (!setUser) throw new BadRequestError('error setting user credentials');

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
