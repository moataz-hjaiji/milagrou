import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IAddress, { AddressModel } from '../../model/Address';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IAddress | null> => {
  let findOneQuery: Query<any, any> = AddressModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
