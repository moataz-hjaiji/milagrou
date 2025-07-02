import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IRole, { RoleModel } from '../../model/Role';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IRole | null> => {
  let findOneQuery: Query<any, any> = RoleModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
