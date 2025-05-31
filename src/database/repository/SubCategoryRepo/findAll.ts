import ISubCategory, { SubCategoryModel } from '../../model/SubCategory';
import { PaginationModel } from 'mongoose-paginate-ts';
import APIFeatures from '../../../helpers/utils/apiFeatures';

type pagingObj = {
  limit: number;
  page: number;
};

const findAll = async (
  paging: pagingObj,
  query: object
): Promise<PaginationModel<ISubCategory>> => {
  let findAllQuery = SubCategoryModel.find({ deletedAt: null });

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
  return (await SubCategoryModel.paginate(
    options
  )) as PaginationModel<ISubCategory>;
};

export default findAll;
