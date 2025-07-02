import OrderRepo from '../../database/repository/OrderRepo';
import { statsParams } from './stats.service';

export const totalOrders = async ({
  startDate,
  endDate,
  types,
}: statsParams) => {
  let aggregationOptions: any = [
    {
      $match: {
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
        totalOrders: { $sum: 1 },
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
      totalOrders: 0,
      totalRevenue: 0,
    };
  }

  return {
    totalOrders: result[0].totalOrders,
    totalRevenue: result[0].totalRevenue,
  };
};
