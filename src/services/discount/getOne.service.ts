import DiscountRepo from '../../database/repository/DiscountRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const discount = await DiscountRepo.findById(id, query);
  if (!discount) throw new BadRequestError('Discount not found');
  return discount;
};
