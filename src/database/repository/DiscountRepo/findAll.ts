import { DiscountModel } from '../../model/Discount';
import { PaginationModel } from 'mongoose-paginate-ts';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import AggregationFeatures from '../../../helpers/utils/apiAggregationFeatures';
import { PRODUCT_DOCUMENT_NAME } from '../../model/Product';
import { CATEGORY_DOCUMENT_NAME } from '../../model/Category';

type pagingObj = {
  limit: number;
  page: number;
};

const findAll = async (paging: pagingObj, query: object): Promise<any> => {
  // let findAllQuery = DiscountModel.find({ deletedAt: null });

  // const features = new APIFeatures(findAllQuery, query)
  //   .filter()
  //   .sort()
  //   .recherche(['type'])
  //   .limitFields()
  //   .populate();

  // const options = {
  //   query: features.query,
  //   limit: paging.limit ? paging.limit : null,
  //   page: paging.page ? paging.page : null,
  // };
  // return (await DiscountModel.paginate(options)) as PaginationModel<IDiscount>;
  const options = {
    limit: paging.limit ? paging.limit : null,
    page: paging.page ? paging.page : null,
  };

  const aggFeatures = new AggregationFeatures([
    {
      $match: {
        deletedAt: null,
      },
    },
    {
      $lookup: {
        from: 'Categories',
        localField: 'target.categoryId',
        foreignField: '_id',
        as: 'target.categoryId',
      },
    },
    {
      $unwind: {
        path: '$target.categoryId',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'Products',
        localField: 'target.productId',
        foreignField: '_id',
        as: 'target.productId',
      },
    },
    {
      $unwind: {
        path: '$target.productId',
        preserveNullAndEmptyArrays: true,
      },
    },
  ])
    .filter(query)
    .sort(query)
    .search(query, [
      'type',
      'target.categoryId.nameAng',
      'target.categoryId.nameAr',
      'target.productId.nameAng',
      'target.productId.nameAr',
    ])
    .limitFields(query);

  const agg = DiscountModel.aggregate(aggFeatures.pipeline);
  return await DiscountModel.aggregatePaginate(agg, options as any);
};

export default findAll;
