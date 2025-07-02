import IUser, { UserModel } from '../../model/User';

const create = async (obj: Partial<IUser>): Promise<IUser> => {
  return await UserModel.create(obj);
};

export default create;
