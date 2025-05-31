import IProduct, { ProductModel } from '../../model/Product';

const create = async (obj: Partial<IProduct>): Promise<IProduct> => {
  return await ProductModel.create(obj);
};

export default create;
