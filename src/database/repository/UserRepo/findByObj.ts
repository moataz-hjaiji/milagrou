import IUser, { UserModel } from '../../model/User';

const findByObj = (obj: object): Promise<IUser | null> => {
  return UserModel.findOne(obj).exec();
};

export default findByObj;
