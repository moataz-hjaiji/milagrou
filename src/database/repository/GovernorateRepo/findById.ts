import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IGovernorate, { GovernorateModel } from '../../model/Governorate';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IGovernorate | null> => {
  let findOneQuery: Query<any, any> = GovernorateModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
