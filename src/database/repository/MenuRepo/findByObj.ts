import IMenu, { MenuModel } from '../../model/Menu';

const findByObj = (obj: object): Promise<IMenu | null> => {
  return MenuModel.findOne(obj).exec();
};

export default findByObj;
