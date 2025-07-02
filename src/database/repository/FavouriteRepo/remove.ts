import { ObjectId } from 'mongoose';
import IFavourite, { FavouriteModel } from '../../model/Favourite';

const remove = async (id: string | ObjectId): Promise<IFavourite | null> => {
  return await FavouriteModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
