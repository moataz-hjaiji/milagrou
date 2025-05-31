import IProduct, { ProductModel } from '../../model/Product';
import { PaginationModel } from 'mongoose-paginate-ts';
import APIFeatures from '../../../helpers/utils/apiFeatures';

type pagingObj = {
  limit: number;
  page: number;
};

const findAll = async (
  paging: pagingObj,
  query: object
): Promise<PaginationModel<IProduct>> => {
  let findAllQuery = ProductModel.find({ deletedAt: null }).populate([
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
  ]);

  const features = new APIFeatures(findAllQuery, query)
    .filter()
    .sort()
    .recherche(['nameFr', 'nameAr'])
    .limitFields()
    .populate();

  const options = {
    query: features.query,
    limit: paging.limit ? paging.limit : null,
    page: paging.page ? paging.page : null,
  };
  return (await ProductModel.paginate(options)) as PaginationModel<IProduct>;
};

export default findAll;
