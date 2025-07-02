import IFavourite, { FavouriteModel } from '../../model/Favourite';

const create = async (obj: Partial<IFavourite>): Promise<IFavourite> => {
  return await FavouriteModel.create(obj);
};

export default create;
