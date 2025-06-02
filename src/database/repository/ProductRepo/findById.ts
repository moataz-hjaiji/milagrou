import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IProduct, { ProductModel } from '../../model/Product';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IProduct | null> => {
  let findOneQuery: Query<any, any> = ProductModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
