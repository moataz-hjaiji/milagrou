import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IMenu, { MenuModel } from '../../model/Menu';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IMenu | null> => {
  let findOneQuery: Query<any, any> = MenuModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
