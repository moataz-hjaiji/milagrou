import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IFeedback, { FeedbackModel } from '../../model/Feedback';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IFeedback | null> => {
  let findOneQuery: Query<any, any> = FeedbackModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
