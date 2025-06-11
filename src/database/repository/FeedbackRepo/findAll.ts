import IFeedback, { FeedbackModel } from '../../model/Feedback';
import { PaginationModel } from 'mongoose-paginate-ts';
import APIFeatures from '../../../helpers/utils/apiFeatures';

type pagingObj = {
  limit: number;
  page: number;
};

const findAll = async (
  paging: pagingObj,
  query: object
): Promise<PaginationModel<IFeedback>> => {
  let findAllQuery = FeedbackModel.find({ deletedAt: null });

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
  return (await FeedbackModel.paginate(options)) as PaginationModel<IFeedback>;
};

export default findAll;
