import PromoCodeRepo from '../../database/repository/PromoCodeRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const promoCode = await PromoCodeRepo.remove(id);
  if (!promoCode) throw new BadRequestError('PromoCode not found');
};
