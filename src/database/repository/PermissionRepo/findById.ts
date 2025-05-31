import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IPermission, { PermissionModel } from '../../model/Permission';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IPermission | null> => {
  let findOneQuery: Query<any, any> = PermissionModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
