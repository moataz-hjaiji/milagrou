import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IOrder, { OrderModel } from '../../model/Order';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IOrder | null> => {
  let findOneQuery: Query<any, any> = OrderModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
