import IPromoCode, { PromoCodeModel } from '../../model/PromoCode';

const findByObj = (obj: object): Promise<IPromoCode | null> => {
  return PromoCodeModel.findOne(obj).exec();
};

export default findByObj;
