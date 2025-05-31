import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError } from '../../core/ApiError';
import { omit } from 'lodash';

interface createParams {
  body: any;
  file?: Express.Request['file'];
}

export const create = async ({ body, file }: createParams) => {
  if (file) body.avatar = file.path;

  const userCheck = await UserRepo.findByObj({ phoneNumber: body.phoneNumber });
  if (userCheck?.verified) {
    throw new BadRequestError('User with that phone number aleardy exists');
  } else if (userCheck && !userCheck?.verified) {
    throw new BadRequestError(
      'unverified User with that phone number aleardy exists'
    );
  }

  const user = await UserRepo.create({
    ...body,
  });
  if (!user) throw new BadRequestError('error creating user');
  const filteredUser = omit(user.toObject(), ['password']);
  return filteredUser;
};
