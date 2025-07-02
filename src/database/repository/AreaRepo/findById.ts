import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IArea, { AreaModel } from '../../model/Area';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IArea | null> => {
  let findOneQuery: Query<any, any> = AreaModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
