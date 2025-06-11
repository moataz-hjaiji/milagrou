import IPromoCode, { PromoCodeModel } from '../../model/PromoCode';
import { PaginationModel } from 'mongoose-paginate-ts';
import APIFeatures from '../../../helpers/utils/apiFeatures';

type pagingObj = {
  limit: number;
  page: number;
};

const findAll = async (
  paging: pagingObj,
  query: object
): Promise<PaginationModel<IPromoCode>> => {
  let findAllQuery = PromoCodeModel.find({ deletedAt: null });

  const features = new APIFeatures(findAllQuery, query)
    .filter()
    .sort()
    .recherche(['code'])
    .limitFields()
    .populate();

  const options = {
    query: features.query,
    limit: paging.limit ? paging.limit : null,
    page: paging.page ? paging.page : null,
  };
  return (await PromoCodeModel.paginate(
    options
  )) as PaginationModel<IPromoCode>;
};

export default findAll;
