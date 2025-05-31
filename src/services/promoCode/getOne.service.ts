import PromoCodeRepo from '../../database/repository/PromoCodeRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const promoCode = await PromoCodeRepo.findById(id, query);
  if (!promoCode) throw new BadRequestError('PromoCode not found');
  return promoCode;
};
