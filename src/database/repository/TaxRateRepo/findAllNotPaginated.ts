import ITaxRate, { TaxRateModel } from '../../model/TaxRate';

const findAll = (obj: object): Promise<ITaxRate[]> => {
  return TaxRateModel.find(obj).exec();
};

export default findAll;
