import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IProductPrice, { ProductPriceModel } from '../../model/ProductPrice';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IProductPrice | null> => {
  let findOneQuery: Query<any, any> = ProductPriceModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
