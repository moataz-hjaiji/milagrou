import { OrderStatus } from '../../database/model/Order';
import OrderRepo from '../../database/repository/OrderRepo';
import { statsParams } from './stats.service';

export const totalCompeletedOrders = async ({
  startDate,
  endDate,
}: statsParams) => {
  const result = await OrderRepo.aggregate([
    {
      $match: {
        status: OrderStatus.COMPLETED,
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
        totalCompeletedOrders: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      totalCompeletedOrders: 0,
    };
  }

  return {
    totalCompeletedOrders: result[0].totalCompeletedOrders,
  };
};
