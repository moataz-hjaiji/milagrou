import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import ICategory, { CategoryModel } from '../../model/Category';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<ICategory | null> => {
  let findOneQuery: Query<any, any> = CategoryModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
