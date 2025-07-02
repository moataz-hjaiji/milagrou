import IUser, { UserModel } from '../../model/User';

const findOneWithObjFull = (obj: object): Promise<IUser | null> => {
  return UserModel.findOne(obj).select('+password').exec();
};

export default findOneWithObjFull;
