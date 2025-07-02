import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IUser, { UserModel } from '../../model/User';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IUser | null> => {
  let findOneQuery: Query<any, any> = UserModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
