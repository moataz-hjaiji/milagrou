import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import ICart, { CartModel } from '../../model/Cart';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<ICart | null> => {
  let findOneQuery: Query<any, any> = CartModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
