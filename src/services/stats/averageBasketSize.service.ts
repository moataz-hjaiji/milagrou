import { OrderStatus } from '../../database/model/Order';
import OrderRepo from '../../database/repository/OrderRepo';
import { statsParams } from './stats.service';

export const averageBasketSize = async ({
  startDate,
  endDate,
}: statsParams) => {
  const result = await OrderRepo.aggregate([
    {
      $match: {
        status: {
          $in: [OrderStatus.DELIVERED],
        },
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: null,
        averagePrice: {
          $avg: '$orderPriceWithoutDeliveryPrice',
        },
      },
    },
  ]);
  return result.length ? Number(result[0].averagePrice.toFixed(2)) : 0;
};
