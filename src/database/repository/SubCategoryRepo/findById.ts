import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import ISubCategory, { SubCategoryModel } from '../../model/SubCategory';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<ISubCategory | null> => {
  let findOneQuery: Query<any, any> = SubCategoryModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
