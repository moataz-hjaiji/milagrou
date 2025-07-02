import bcryptjs from 'bcryptjs';
import _, { omit } from 'lodash';
import UserRepo from '../../database/repository/UserRepo';
import {
  BadRequestError,
  AuthFailureError,
  NotFoundError,
} from '../../core/ApiError';
import KeystoreRepo from '../../database/repository/KeystoreRepo';
import { createTokens } from '../../authUtils/authUtils';
import { generateKeys } from '../../helpers/utils/auth';
import RoleRepo from '../../database/repository/RoleRepo';

interface LoginParams {
  email: string;
  password: string;
}

export const loginAdmin = async ({ email, password }: LoginParams) => {
  const emailToLowerCase = email.toLocaleLowerCase();

  const roleUser = await RoleRepo.findByCode('user');
  if (!roleUser) throw new NotFoundError('user role not found');

  const admin = await UserRepo.findByObjFull({
    email: emailToLowerCase,
    roles: { $nin: [roleUser.id] },
  });

  if (!admin) throw new BadRequestError('Admin not registered');

  const match = await bcryptjs.compare(password, admin.password);
  if (!match) throw new AuthFailureError('Invalid credentials');

  const { accessTokenKey, refreshTokenKey } = generateKeys();
  await KeystoreRepo.create(admin.id, accessTokenKey, refreshTokenKey);
  const [tokens] = await Promise.all([
    createTokens(admin, accessTokenKey, refreshTokenKey),
    admin,
  ]);

  const filteredUser = omit(admin.toObject(), ['password']);

  admin.lastLogin = new Date();
  await admin.save();

  return {
    tokens: tokens,
    admin: filteredUser,
  };
};
