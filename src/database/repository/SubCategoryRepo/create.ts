import ISubCategory, { SubCategoryModel } from '../../model/SubCategory';

const create = async (obj: Partial<ISubCategory>): Promise<ISubCategory> => {
  return await SubCategoryModel.create(obj);
};

export default create;
