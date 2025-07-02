import { BadRequestError } from '../../core/ApiError';
import RoleRepo from '../../database/repository/RoleRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  const checkRoleName = await RoleRepo.findByObj({ name: body.name });
  if (checkRoleName)
    throw new BadRequestError('role with that name already exists');
  const role = await RoleRepo.create(body);
  if (!role) throw new BadRequestError('error creating role');
  return role;
};
