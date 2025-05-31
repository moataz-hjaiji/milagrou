import RoleRepo from '../../database/repository/RoleRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const role = await RoleRepo.findById(id, query);
  if (!role) throw new BadRequestError('Role not found');
  return role;
};
