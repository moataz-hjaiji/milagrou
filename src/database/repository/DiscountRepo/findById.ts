import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IDiscount, { DiscountModel } from '../../model/Discount';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IDiscount | null> => {
  let findOneQuery: Query<any, any> = DiscountModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
