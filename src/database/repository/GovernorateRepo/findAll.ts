import IGovernorate, { GovernorateModel } from '../../model/Governorate';
import { PaginationModel } from 'mongoose-paginate-ts';
import APIFeatures from '../../../helpers/utils/apiFeatures';

type pagingObj = {
  limit: number;
  page: number;
};

const findAll = async (
  paging: pagingObj,
  query: object
): Promise<PaginationModel<IGovernorate>> => {
  let findAllQuery = GovernorateModel.find({ deletedAt: null });

  const features = new APIFeatures(findAllQuery, query)
    .filter()
    .sort()
    .recherche(['name'])
    .limitFields()
    .populate();

  const options = {
    query: features.query,
    limit: paging.limit ? paging.limit : null,
    page: paging.page ? paging.page : null,
  };
  return (await GovernorateModel.paginate(
    options
  )) as PaginationModel<IGovernorate>;
};

export default findAll;
