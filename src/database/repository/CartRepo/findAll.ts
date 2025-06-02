import ICart, { CartModel } from '../../model/Cart';
import { PaginationModel } from 'mongoose-paginate-ts';
import APIFeatures from '../../../helpers/utils/apiFeatures';

type pagingObj = {
  limit: number;
  page: number;
  populate: string;
};

const findAll = async (
  paging: pagingObj,
  query: object
): Promise<PaginationModel<ICart>> => {
  let findAllQuery = CartModel.find({ deletedAt: null });

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
  return (await CartModel.paginate(options)) as PaginationModel<ICart>;
};

export default findAll;
