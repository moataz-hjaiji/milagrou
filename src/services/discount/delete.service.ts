import DiscountRepo from '../../database/repository/DiscountRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const discount = await DiscountRepo.remove(id);
  if (!discount) throw new BadRequestError('Discount not found');
};
