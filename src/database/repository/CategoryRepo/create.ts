import ICategory, { CategoryModel } from '../../model/Category';

const create = async (obj: Partial<ICategory>): Promise<ICategory> => {
  return await CategoryModel.create(obj);
};

export default create;
