import OrderRepo from '../../database/repository/OrderRepo';

const now = new Date();
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

export const todayOrders = async () => {
  let aggregationOptions: any = [
    {
      $match: {
        createdAt: {
          $gte: oneDayAgo,
          $lte: now,
        },
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
      },
    },
  ];

  const result = await OrderRepo.aggregate(aggregationOptions);

  if (result.length === 0) {
    return {
      totalOrders: 0,
    };
  }

  return {
    totalOrders: result[0].totalOrders,
  };
};
