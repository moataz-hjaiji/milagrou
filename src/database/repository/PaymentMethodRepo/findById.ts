import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IPaymentMethod, { PaymentMethodModel } from '../../model/PaymentMethod';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IPaymentMethod | null> => {
  let findOneQuery: Query<any, any> = PaymentMethodModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
