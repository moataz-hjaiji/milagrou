import { BadRequestError } from '../../core/ApiError';
import PromoCodeRepo from '../../database/repository/PromoCodeRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  const checkPromoCode = await PromoCodeRepo.findByObj({ code: body.code });
  if (checkPromoCode)
    throw new BadRequestError('Promo code with that code already exists');
  const promoCode = await PromoCodeRepo.create(body);
  if (!promoCode) throw new BadRequestError('error creating promoCode');
  return promoCode;
};
