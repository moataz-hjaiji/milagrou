import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IDeliveryPrice, { DeliveryPriceModel } from '../../model/DeliveryPrice';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IDeliveryPrice | null> => {
  let findOneQuery: Query<any, any> = DeliveryPriceModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
