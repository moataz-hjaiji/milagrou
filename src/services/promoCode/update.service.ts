import PromoCodeRepo from '../../database/repository/PromoCodeRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const promoCode = await PromoCodeRepo.update(id, body);
  if (!promoCode) throw new BadRequestError('promoCode not found');
  return promoCode;
};
