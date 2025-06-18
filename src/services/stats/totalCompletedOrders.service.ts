import { OrderStatus } from '../../database/model/Order';
import OrderRepo from '../../database/repository/OrderRepo';
import { statsParams } from './stats.service';

export const totalCompeletedOrders = async ({
  startDate,
  endDate,
  types,
}: statsParams) => {
  let aggregationOptions: any = [
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
      totalCompeletedOrders: 0,
      totalRevenue: 0,
    };
  }

  return {
    totalCompeletedOrders: result[0].totalCompeletedOrders,
    totalRevenue: result[0].totalRevenue,
  };
};
