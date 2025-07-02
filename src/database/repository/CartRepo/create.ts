import ICart, { CartModel } from '../../model/Cart';

const create = async (obj: Partial<ICart>): Promise<ICart> => {
  return await CartModel.create(obj);
};

export default create;
