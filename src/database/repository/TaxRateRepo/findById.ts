import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import ITaxRate, { TaxRateModel } from '../../model/TaxRate';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<ITaxRate | null> => {
  let findOneQuery: Query<any, any> = TaxRateModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
