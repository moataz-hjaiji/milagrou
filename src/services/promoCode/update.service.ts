import PromoCodeRepo from '../../database/repository/PromoCodeRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  if (body.code) {
    const checkPromoCode = await PromoCodeRepo.findByObj({ code: body.code });
    if (checkPromoCode)
      throw new BadRequestError('Promo code with that code already exists');
  }

  const promoCode = await PromoCodeRepo.update(id, body);
  if (!promoCode) throw new BadRequestError('promoCode not found');
  return promoCode;
};
