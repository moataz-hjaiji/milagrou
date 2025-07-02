import ICategory, { CategoryModel } from '../../model/Category';

const findAll = (obj: object): Promise<ICategory[]> => {
  return CategoryModel.find(obj).exec();
};

export default findAll;
