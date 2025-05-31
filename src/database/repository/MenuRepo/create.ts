import IMenu, { MenuModel } from '../../model/Menu';

const create = async (obj: Partial<IMenu>): Promise<IMenu> => {
  return await MenuModel.create(obj);
};

export default create;
