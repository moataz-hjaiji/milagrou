import { OrderStatus } from '../../database/model/Order';
import OrderRepo from '../../database/repository/OrderRepo';
import { statsParams } from './stats.service';

export const totalRevenue = async ({ startDate, endDate }: statsParams) => {
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
        totalPrice: {
          $sum: '$orderPriceWithoutDeliveryPrice',
        },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      totalPrice: 0,
      totalOrders: 0,
    };
  }

  return {
    totalPrice: result[0].totalPrice,
    totalOrders: result[0].totalOrders,
  };
};
