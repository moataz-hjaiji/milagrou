import IPermission, { PermissionModel } from '../../model/Permission';

const create = async (obj: Partial<IPermission>): Promise<IPermission> => {
  return await PermissionModel.create(obj);
};

export default create;
