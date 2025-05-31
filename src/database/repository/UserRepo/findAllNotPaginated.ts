import IUser, { UserModel } from '../../model/User';

const findAllNotPaginated = (obj: object): Promise<IUser[]> => {
  return UserModel.find(obj).exec();
};

export default findAllNotPaginated;
