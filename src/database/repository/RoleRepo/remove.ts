import { ObjectId } from 'mongoose';
import IRole, { RoleModel } from '../../model/Role';

const remove = async (id: string | ObjectId): Promise<IRole | null> => {
  return await RoleModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
