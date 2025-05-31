import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const user = await UserRepo.remove(id);
  if (!user) throw new BadRequestError('User not found');
};
