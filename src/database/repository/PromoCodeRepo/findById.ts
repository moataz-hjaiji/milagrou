import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IPromoCode, { PromoCodeModel } from '../../model/PromoCode';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IPromoCode | null> => {
  let findOneQuery: Query<any, any> = PromoCodeModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
