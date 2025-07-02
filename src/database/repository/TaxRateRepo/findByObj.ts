import ITaxRate, { TaxRateModel } from '../../model/TaxRate';

const findByObj = (obj: object): Promise<ITaxRate | null> => {
  return TaxRateModel.findOne(obj).exec();
};

export default findByObj;
