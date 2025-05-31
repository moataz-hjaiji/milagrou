import IRole, { RoleModel } from '../../model/Role';

const findByObj = (obj: object): Promise<IRole | null> => {
  return RoleModel.findOne(obj).exec();
};

export default findByObj;
