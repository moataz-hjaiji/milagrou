import crypto from 'crypto';
import JWT from '../../core/JWT';
import UserRepo from '../../database/repository/UserRepo';
import { AuthFailureError } from '../../core/ApiError';
import KeystoreRepo from '../../database/repository/KeystoreRepo';
import {
  validateTokenData,
  createTokens,
  getAccessToken,
} from '../../authUtils/authUtils';
import { ProtectedRequest } from 'app-request';

export const refreshToken = async (req: ProtectedRequest) => {
  req.accessToken = getAccessToken(req.headers.authorization); // Express headers are auto converted to lowercase

  const accessTokenPayload = await JWT.decode(req.accessToken);

  validateTokenData(accessTokenPayload);

  const user = await UserRepo.findById(accessTokenPayload.sub);
  if (!user) throw new AuthFailureError('User not registered');
  req.user = user;

  const refreshTokenPayload = await JWT.validate(req.body.refreshToken);
  validateTokenData(refreshTokenPayload);

  if (accessTokenPayload.sub !== refreshTokenPayload.sub)
    throw new AuthFailureError('Invalid access token');

  const keystore = await KeystoreRepo.find(
    req.user.id,
    accessTokenPayload.prm,
    refreshTokenPayload.prm
  );

  if (!keystore) throw new AuthFailureError('Invalid access token');
  await KeystoreRepo.remove(keystore.id);

  const accessTokenKey = crypto.randomBytes(64).toString('hex');
  const refreshTokenKey = crypto.randomBytes(64).toString('hex');

  await KeystoreRepo.create(req.user.id, accessTokenKey, refreshTokenKey);
  const tokens = await createTokens(req.user, accessTokenKey, refreshTokenKey);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};
