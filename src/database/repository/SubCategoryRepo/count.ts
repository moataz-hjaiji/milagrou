import { SubCategoryModel } from '../../model/SubCategory';

const countDocuments = async (obj: object) => {
  return await SubCategoryModel.countDocuments(obj);
};

export default countDocuments;
