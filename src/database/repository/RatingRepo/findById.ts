import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IRating, { RatingModel } from '../../model/Rating';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IRating | null> => {
  let findOneQuery: Query<any, any> = RatingModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
