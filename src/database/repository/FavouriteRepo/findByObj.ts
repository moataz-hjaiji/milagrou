import IFavourite, { FavouriteModel } from '../../model/Favourite';

const findByObj = (obj: object): Promise<IFavourite | null> => {
  return FavouriteModel.findOne(obj).exec();
};

export default findByObj;
