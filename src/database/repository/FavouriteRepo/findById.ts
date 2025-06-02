import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IFavourite, { FavouriteModel } from '../../model/Favourite';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IFavourite | null> => {
  let findOneQuery: Query<any, any> = FavouriteModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
