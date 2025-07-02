import IDiscount, { DiscountModel } from '../../model/Discount';

const findByObj = (obj: object): Promise<IDiscount | null> => {
  return DiscountModel.findOne(obj).exec();
};

export default findByObj;
