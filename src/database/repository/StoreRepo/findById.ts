import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IStore, { StoreModel } from '../../model/Store';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IStore | null> => {
  let findOneQuery: Query<any, any> = StoreModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
