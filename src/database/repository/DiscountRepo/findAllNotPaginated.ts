import IDiscount, { DiscountModel } from '../../model/Discount';

const findAll = (obj: object): Promise<IDiscount[]> => {
  return DiscountModel.find(obj).exec();
};

export default findAll;
