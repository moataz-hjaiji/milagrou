import RoleRepo from '../../database/repository/RoleRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const checkUntouchableRoles = await RoleRepo.findById(id);
  if (
    checkUntouchableRoles &&
    ['user', 'admin'].includes(checkUntouchableRoles.name)
  ) {
    throw new BadRequestError(
      'role name invalid: you cant change standard role names (admin, user)'
    );
  }
  const role = await RoleRepo.remove(id);
  if (!role) throw new BadRequestError('Role not found');
};
