import { ObjectId, Query } from 'mongoose';
import APIFeatures from '../../../helpers/utils/apiFeatures';
import ISupplementCategory, {
  SupplementCategoryModel,
} from '../../model/SupplementCategory';

const findById = async (
  id: string | ObjectId,
  queryString?: any
): Promise<ISupplementCategory | null> => {
  let findOneQuery: Query<any, any> = SupplementCategoryModel.findById(id);

  const features = new APIFeatures(findOneQuery, queryString)
    .limitFields()
    .populate();

  return await features.query.exec();
};

export default findById;
