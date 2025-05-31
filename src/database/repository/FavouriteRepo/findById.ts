import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IFavourite, { FavouriteModel } from '../../model/Favourite';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IFavourite | null> => {
  let findOneQuery: Query<any, any> = FavouriteModel.findById(id).populate([
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

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
