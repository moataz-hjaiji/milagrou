import IProductPrice, { ProductPriceModel } from '../../model/ProductPrice';

const findAll = (obj: object): Promise<IProductPrice[]> => {
  return ProductPriceModel.find(obj).exec();
};

export default findAll;
