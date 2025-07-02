import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const user = await UserRepo.findById(id, query);
  if (!user) throw new BadRequestError('User not found');
  return user;
};
