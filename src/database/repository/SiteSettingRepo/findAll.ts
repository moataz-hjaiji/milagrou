import ISiteSetting, { SiteSettingModel } from '../../model/SiteSetting';
import { PaginationModel } from 'mongoose-paginate-ts';
import APIFeatures from '../../../helpers/utils/apiFeatures';

type pagingObj = {
  limit: number;
  page: number;
};

const findAll = async (
  paging: pagingObj,
  query: object
): Promise<PaginationModel<ISiteSetting>> => {
  let findAllQuery = SiteSettingModel.find({ deletedAt: null });

  const features = new APIFeatures(findAllQuery, query)
    .filter()
    .sort()
    .recherche(['nameAng', 'nameAr'])
    .limitFields()
    .populate();

  const options = {
    query: features.query,
    limit: paging.limit ? paging.limit : null,
    page: paging.page ? paging.page : null,
  };
  return (await SiteSettingModel.paginate(
    options
  )) as PaginationModel<ISiteSetting>;
};

export default findAll;
