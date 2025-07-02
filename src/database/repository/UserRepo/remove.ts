import { ObjectId } from 'mongoose';
import IUser, { UserModel } from '../../model/User';

const remove = async (id: string | ObjectId): Promise<IUser | null> => {
  return await UserModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
