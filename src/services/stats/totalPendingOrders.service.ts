import { OrderStatus } from '../../database/model/Order';
import OrderRepo from '../../database/repository/OrderRepo';
import { statsParams } from './stats.service';

export const totalPendingOrders = async ({
  startDate,
  endDate,
  types,
}: statsParams) => {
  let aggregationOptions: any = [
    {
      $match: {
        status: OrderStatus.PENDING,
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
        totalPendingOrders: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: '$orderPriceWithoutDeliveryPrice',
        },
      },
    },
  ];
  if (types)
    aggregationOptions.push({
      $match: {
        orderType: {
          $in: types,
        },
      },
    });

  const result = await OrderRepo.aggregate(aggregationOptions);

  if (result.length === 0) {
    return {
      totalPendingOrders: 0,
      totalRevenue: 0,
    };
  }

  return {
    totalPendingOrders: result[0].totalPendingOrders,
    totalRevenue: result[0].totalRevenue,
  };
};
