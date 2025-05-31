import DeliveryPriceRepo from '../../database/repository/DeliveryPriceRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  if (body.isActive === true) {
    const deliveryPriceCheck = await DeliveryPriceRepo.findByObj({
      isActive: true,
    });
    if (deliveryPriceCheck)
      throw new BadRequestError('an active delivery price already exists');
  }

  const deliveryPrice = await DeliveryPriceRepo.update(id, body);
  if (!deliveryPrice) throw new BadRequestError('deliveryPrice not found');
  return deliveryPrice;
};
