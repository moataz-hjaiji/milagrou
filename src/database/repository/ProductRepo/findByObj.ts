import IProduct, { ProductModel } from '../../model/Product';

const findByObj = (obj: object): Promise<IProduct | null> => {
  return ProductModel.findOne(obj).exec();
};

export default findByObj;
