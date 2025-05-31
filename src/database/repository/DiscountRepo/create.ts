import IDiscount, { DiscountModel } from '../../model/Discount';

const create = async (obj: Partial<IDiscount>): Promise<IDiscount> => {
  return await DiscountModel.create(obj);
};

export default create;
