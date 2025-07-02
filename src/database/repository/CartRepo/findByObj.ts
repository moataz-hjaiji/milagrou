import ICart, { CartModel } from '../../model/Cart';

const findByObj = (obj: object): Promise<ICart | null> => {
  return CartModel.findOne(obj).exec();
};

export default findByObj;
