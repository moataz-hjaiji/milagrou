import IDeliveryPrice, { DeliveryPriceModel } from '../../model/DeliveryPrice';
import { PaginationModel } from 'mongoose-paginate-ts';
import APIFeatures from '../../../helpers/utils/apiFeatures';

type pagingObj = {
  limit: number;
  page: number;
};

const findAll = async (
  paging: pagingObj,
  query: object
): Promise<PaginationModel<IDeliveryPrice>> => {
  let findAllQuery = DeliveryPriceModel.find({ deletedAt: null });

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
  return (await DeliveryPriceModel.paginate(
    options
  )) as PaginationModel<IDeliveryPrice>;
};

export default findAll;
