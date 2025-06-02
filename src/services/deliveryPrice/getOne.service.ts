import DeliveryPriceRepo from '../../database/repository/DeliveryPriceRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const deliveryPrice = await DeliveryPriceRepo.findById(id, query);
  if (!deliveryPrice) throw new BadRequestError('DeliveryPrice not found');
  return deliveryPrice;
};
