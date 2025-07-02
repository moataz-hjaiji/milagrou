import PermissionRepo from '../../database/repository/PermissionRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const permission = await PermissionRepo.findById(id, query);
  if (!permission) throw new BadRequestError('Permission not found');
  return permission;
};
