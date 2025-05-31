import DeliveryPriceRepo from '../../database/repository/DeliveryPriceRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const deliveryPrice = await DeliveryPriceRepo.remove(id);
  if (!deliveryPrice) throw new BadRequestError('DeliveryPrice not found');
};
