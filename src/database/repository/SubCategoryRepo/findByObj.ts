import ISubCategory, { SubCategoryModel } from '../../model/SubCategory';

const findByObj = (obj: object): Promise<ISubCategory | null> => {
  return SubCategoryModel.findOne(obj).exec();
};

export default findByObj;
