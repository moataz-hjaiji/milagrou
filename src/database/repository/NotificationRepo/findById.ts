import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import INotification, { NotificationModel } from '../../model/Notification';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<INotification | null> => {
  let findOneQuery: Query<any, any> = NotificationModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
