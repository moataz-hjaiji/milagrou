import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import IProduct, { ProductModel } from '../../model/Product';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<IProduct | null> => {
  let findOneQuery: Query<any, any> = ProductModel.findById(id).populate([
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

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
