import { OrderStatus } from '../../database/model/Order';
import OrderRepo from '../../database/repository/OrderRepo';
import { statsParams } from './stats.service';

export const ordersCompletedByDelivery = async ({
  startDate,
  endDate,
  deliveryGuyId,
}: statsParams) => {
  const result = await OrderRepo.aggregate([
    {
      $match: {
        status: OrderStatus.DELIVERED,
        deliveryGuyId: deliveryGuyId,
        deliveryGuyacceptance: true,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        deletedAt: null,
      },
    },
    {
      $count: 'totalOrders',
    },
  ]);
  return result.length ? result[0].totalOrders : 0;
};
