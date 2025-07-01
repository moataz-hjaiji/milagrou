import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError } from '../../core/ApiError';
import { generateKeys } from '../../helpers/utils/auth';
import KeystoreRepo from '../../database/repository/KeystoreRepo';
import { createTokens } from '../../authUtils/authUtils';
import { omit } from 'lodash';
import bcryptjs from 'bcryptjs';
import { ObjectId } from 'mongoose';

interface changePasswordParams {
  userId: ObjectId;
  oldPassword: string;
  newPassword: string;
}

export const changePassword = async ({
  userId,
  oldPassword,
  newPassword,
}: changePasswordParams) => {
  const user = await UserRepo.findByObjFull({
    _id: userId,
  });
  if (!user) throw new BadRequestError('user not found');

  const match = await bcryptjs.compare(oldPassword, user.password);
  if (!match) throw new BadRequestError('Invalid old password');

  const setUser = await UserRepo.update(user.id, {
    password: await bcryptjs.hash(newPassword, 12),
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
