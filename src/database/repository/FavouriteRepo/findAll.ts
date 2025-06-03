import IFavourite, { FavouriteModel } from '../../model/Favourite';
import { PaginationModel } from 'mongoose-paginate-ts';
import APIFeatures from '../../../helpers/utils/apiFeatures';

type pagingObj = {
  limit: number;
  page: number;
  populate: any;
};

const findAll = async (
  paging: pagingObj,
  query: object
): Promise<PaginationModel<IFavourite>> => {
  let findAllQuery = FavouriteModel.find({ deletedAt: null });

  const features = new APIFeatures(findAllQuery, query)
    .filter()
    .sort()
    .recherche([''])
    .limitFields()
    .populate();

  const options = {
    query: features.query,
    limit: paging.limit ? paging.limit : null,
    page: paging.page ? paging.page : null,
    populate: paging.populate ? paging.populate : null,
  };
  return (await FavouriteModel.paginate(
    options
  )) as PaginationModel<IFavourite>;
};

export default findAll;
