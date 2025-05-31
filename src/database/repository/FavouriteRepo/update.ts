import { ObjectId } from 'mongoose';
import IFavourite, { FavouriteModel } from '../../model/Favourite';

const update = async (
  id: string | ObjectId,
  obj: Partial<IFavourite>
): Promise<IFavourite | null> => {
  return await FavouriteModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
