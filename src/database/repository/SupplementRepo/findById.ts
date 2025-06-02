import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import ISupplement, { SupplementModel } from '../../model/Supplement';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<ISupplement | null> => {
  let findOneQuery: Query<any, any> = SupplementModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
