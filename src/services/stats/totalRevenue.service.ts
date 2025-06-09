import { PaymentStatus } from '../../database/model/Order';
import OrderRepo from '../../database/repository/OrderRepo';
import { statsParams } from './stats.service';

export const totalRevenue = async ({ startDate, endDate }: statsParams) => {
  const result = await OrderRepo.aggregate([
    {
      $match: {
        paymentStatus: PaymentStatus.PAID,
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
        totalRevenue: {
          $sum: '$orderPriceWithoutDeliveryPrice',
        },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      totalRevenue: 0,
    };
  }

  return {
    totalRevenue: result[0].totalRevenue,
  };
};
