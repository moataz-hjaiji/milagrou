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
  emailOrUserName: string;
  password: string;
}

export const loginDelivery = async ({
  emailOrUserName,
  password,
}: LoginParams) => {
  const roleDelivery = await RoleRepo.findByCode('delivery');
  if (!roleDelivery) throw new NotFoundError('delivery role not found');

  const delivery = await UserRepo.findByObjFull({
    roles: roleDelivery.id,
    $or: [{ email: emailOrUserName }, { userName: emailOrUserName }],
  });

  if (!delivery) throw new BadRequestError('Delivery guy not registered');
  if (delivery.verified === false)
    throw new BadRequestError('Delivery guy not verified');

  const match = await bcryptjs.compare(password, delivery.password);
  if (!match) throw new AuthFailureError('Invalid credentials');

  const { accessTokenKey, refreshTokenKey } = generateKeys();
  await KeystoreRepo.create(delivery.id, accessTokenKey, refreshTokenKey);
  const [tokens] = await Promise.all([
    createTokens(delivery, accessTokenKey, refreshTokenKey),
    delivery,
  ]);

  const filteredUser = omit(delivery.toObject(), ['password']);

  return {
    tokens: tokens,
    delivery: filteredUser,
  };
};
