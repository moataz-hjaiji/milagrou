import RoleRepo from '../../database/repository/RoleRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  if (body.name) {
    const checkRoleName = await RoleRepo.findByObj({ name: body.name });
    if (checkRoleName)
      throw new BadRequestError('role with that name already exists');
  }

  const checkUntouchableRoles = await RoleRepo.findById(id);
  if (
    checkUntouchableRoles &&
    ['user', 'admin'].includes(checkUntouchableRoles.name)
  ) {
    throw new BadRequestError(
      'role name invalid: you cant change standard role names (admin, user)'
    );
  }

  const role = await RoleRepo.update(id, body);
  if (!role) throw new BadRequestError('role not found');
  return role;
};
