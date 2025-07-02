import { OrderStatus } from '../../database/model/Order';
import OrderRepo from '../../database/repository/OrderRepo';
import { statsParams } from './stats.service';

export const totalAcceptedOrders = async ({
  startDate,
  endDate,
  types,
}: statsParams) => {
  let aggregationOptions: any = [
    {
      $match: {
        status: OrderStatus.ACCEPTED,
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
        totalAcceptedOrders: { $sum: 1 },
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
      totalAcceptedOrders: 0,
      totalRevenue: 0,
    };
  }

  return {
    totalAcceptedOrders: result[0].totalAcceptedOrders,
    totalRevenue: result[0].totalRevenue,
  };
};
