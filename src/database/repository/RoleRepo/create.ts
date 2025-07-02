import IRole, { RoleModel } from '../../model/Role';

const create = async (obj: Partial<IRole>): Promise<IRole> => {
  return await RoleModel.create(obj);
};

export default create;
