import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import ISiteSetting, { SiteSettingModel } from '../../model/SiteSetting';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<ISiteSetting | null> => {
  let findOneQuery: Query<any, any> = SiteSettingModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
