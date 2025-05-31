import IProductPrice, { ProductPriceModel } from '../../model/ProductPrice';

const create = async (obj: Partial<IProductPrice>): Promise<IProductPrice> => {
  return await ProductPriceModel.create(obj);
};

export default create;
