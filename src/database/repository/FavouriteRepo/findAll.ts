import IFavourite, { FavouriteModel } from '../../model/Favourite';
import { PaginationModel } from 'mongoose-paginate-ts';
import APIFeatures from '../../../helpers/utils/apiFeatures';

type pagingObj = {
  limit: number;
  page: number;
};

const findAll = async (
  paging: pagingObj,
  query: object
): Promise<PaginationModel<IFavourite>> => {
  let findAllQuery = FavouriteModel.find({ deletedAt: null }).populate([
    {
      path: 'product',
      select: ' -createdAt -updatedAt',
      populate: [
        { path: 'productPrice', select: ' -createdAt -updatedAt' },
        {
          path: 'subCategory',
          populate: [
            {
              path: 'category',
              populate: [
                { path: 'menu', select: '-description -createdAt -updatedAt' },
              ],
              select: '-description -createdAt -updatedAt',
            },
          ],
          select: '-description -createdAt -updatedAt',
        },
        {
          path: 'category',
          populate: [
            { path: 'menu', select: '-description -createdAt -updatedAt' },
          ],
          select: '-description -createdAt -updatedAt',
        },
      ],
    },
  ]);

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
  };
  return (await FavouriteModel.paginate(
    options
  )) as PaginationModel<IFavourite>;
};

export default findAll;
