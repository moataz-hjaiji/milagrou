import { ObjectId } from 'mongoose';
import IPermission, { PermissionModel } from '../../model/Permission';

const remove = async (id: string | ObjectId): Promise<IPermission | null> => {
  return await PermissionModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
