import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IBanner, { BannerModel } from '../../model/Banner';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IBanner | null> => {
  let findOneQuery: Query<any, any> = BannerModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
