import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IPopup, { PopupModel } from '../../model/Popup';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IPopup | null> => {
  let findOneQuery: Query<any, any> = PopupModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
