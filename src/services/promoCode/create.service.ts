import { BadRequestError } from '../../core/ApiError';
import PromoCodeRepo from '../../database/repository/PromoCodeRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  const promoCode = await PromoCodeRepo.create(body);
  if (!promoCode) throw new BadRequestError('error creating promoCode');
  return promoCode;
};
