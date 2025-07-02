import IPromoCode, { PromoCodeModel } from '../../model/PromoCode';

const create = async (obj: Partial<IPromoCode>): Promise<IPromoCode> => {
  return await PromoCodeModel.create(obj);
};

export default create;
