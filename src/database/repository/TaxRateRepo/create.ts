import ITaxRate, { TaxRateModel } from '../../model/TaxRate';

const create = async (obj: Partial<ITaxRate>): Promise<ITaxRate> => {
  return await TaxRateModel.create(obj);
};

export default create;
