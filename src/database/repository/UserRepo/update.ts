import { ObjectId } from 'mongoose';
import IUser, { UserModel } from '../../model/User';

const update = async (
  id: string | ObjectId,
  obj: Partial<IUser>
): Promise<IUser | null> => {
  return await UserModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
