import IProductPrice, { ProductPriceModel } from '../../model/ProductPrice';

const findByObj = (obj: object): Promise<IProductPrice | null> => {
  return ProductPriceModel.findOne(obj).exec();
};

export default findByObj;
