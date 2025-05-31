import bcryptjs from 'bcryptjs';
import UserRepo from '../../database/repository/UserRepo';
import {
  BadRequestError,
  AuthFailureError,
  NotFoundError,
} from '../../core/ApiError';
import KeystoreRepo from '../../database/repository/KeystoreRepo';
import { createTokens } from '../../authUtils/authUtils';
import { generateKeys } from '../../helpers/utils/auth';
import { omit } from 'lodash';
import RoleRepo from '../../database/repository/RoleRepo';

interface LoginParams {
  phoneNumber: string;
  password: string;
}

export const loginUser = async ({ phoneNumber, password }: LoginParams) => {
  const roleUser = await RoleRepo.findByCode('user');
  if (!roleUser) throw new NotFoundError('user role not found');

  const user = await UserRepo.findByObjFull({
    phoneNumber,
    roles: roleUser.id,
  });

  if (!user) throw new BadRequestError('User not registered');
  if (user.verified === false) throw new BadRequestError('User not verified');

  const match = await bcryptjs.compare(password, user.password);
  if (!match) throw new AuthFailureError('Invalid credentials');

  const { accessTokenKey, refreshTokenKey } = generateKeys();
  await KeystoreRepo.create(user.id, accessTokenKey, refreshTokenKey);
  const [tokens] = await Promise.all([
    createTokens(user, accessTokenKey, refreshTokenKey),
    user,
  ]);

  const filteredUser = omit(user.toObject(), ['password']);

  return {
    tokens: tokens,
    user: filteredUser,
  };
};
