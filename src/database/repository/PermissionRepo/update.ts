import { ObjectId } from 'mongoose';
import IPermission, { PermissionModel } from '../../model/Permission';

const update = async (
  id: string | ObjectId,
  obj: Partial<IPermission>
): Promise<IPermission | null> => {
  return await PermissionModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
