import { BadRequestError } from '../../core/ApiError';
import DeliveryPriceRepo from '../../database/repository/DeliveryPriceRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  if (body.isActive === true) {
    const deliveryPriceCheck = await DeliveryPriceRepo.findByObj({
      isActive: true,
    });
    if (deliveryPriceCheck)
      throw new BadRequestError('an active delivery price already exists');
  }

  const deliveryPrice = await DeliveryPriceRepo.create(body);
  if (!deliveryPrice) throw new BadRequestError('error creating deliveryPrice');
  return deliveryPrice;
};
