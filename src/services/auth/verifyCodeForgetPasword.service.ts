import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import RoleRepo from '../../database/repository/RoleRepo';

interface verifyCodeParams {
  phoneNumber: string;
  forgetConfirmationCode: number;
}

export const verifyCodeForgetPasword = async ({
  phoneNumber,
  forgetConfirmationCode,
}: verifyCodeParams) => {
  const userCheck = await UserRepo.findByObj({
    phoneNumber,
    forgetConfirmationCode,
  });
  if (!userCheck) throw new BadRequestError('invalid verification code');
};
