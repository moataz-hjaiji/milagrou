import Role, { RoleModel } from '../../model/Role';

const findByCode = (code: string): Promise<Role | null> => {
  return RoleModel.findOne({ name: code }).exec();
};

export default findByCode;
