import ICategory, { CategoryModel } from '../../model/Category';

const findByObj = (obj: object): Promise<ICategory | null> => {
  return CategoryModel.findOne(obj).exec();
};

export default findByObj;
