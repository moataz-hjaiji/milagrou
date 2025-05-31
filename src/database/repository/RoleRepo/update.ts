import { ObjectId } from 'mongoose';
import IRole, { RoleModel } from '../../model/Role';

const update = async (
  id: string | ObjectId,
  obj: Partial<IRole>
): Promise<IRole | null> => {
  return await RoleModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
