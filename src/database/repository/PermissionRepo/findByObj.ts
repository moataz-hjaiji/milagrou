import IPermission, { PermissionModel } from '../../model/Permission';

const findByObj = (obj: object): Promise<IPermission | null> => {
  return PermissionModel.findOne(obj).exec();
};

export default findByObj;
