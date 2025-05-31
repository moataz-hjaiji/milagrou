import { BadRequestError } from '../../core/ApiError';
import { OrderStatus } from '../../database/model/Order';
import OrderRepo from '../../database/repository/OrderRepo';
import UserRepo from '../../database/repository/UserRepo';
import { statsParams } from './stats.service';

export const conversionRate = async ({ startDate, endDate }: statsParams) => {
  const newUsersResult = await UserRepo.aggregate([
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
        totalNewUsers: { $sum: 1 },
        userIds: { $push: '$_id' },
      },
    },
  ]);

  // If no new users in the period, return 0%
  if (!newUsersResult.length || newUsersResult[0].totalNewUsers === 0) {
    return {
      conversionRate: 0,
      totalNewUsers: 0,
      usersWhoOrdered: 0,
    };
  }

  // Get the number of these new users who placed orders
  const usersWithOrdersResult = await OrderRepo.aggregate([
    {
      $match: {
        status: {
          $in: [OrderStatus.DELIVERED],
        },
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        userId: {
          $in: newUsersResult[0].userIds,
        },
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: '$userId',
        orderCount: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        usersWhoOrdered: { $sum: 1 },
      },
    },
  ]);

  const totalNewUsers = newUsersResult[0].totalNewUsers;
  const usersWhoOrdered = usersWithOrdersResult.length
    ? usersWithOrdersResult[0].usersWhoOrdered
    : 0;

  // Calculate conversion rate as percentage
  const conversionRate = Number(
    ((usersWhoOrdered / totalNewUsers) * 100).toFixed(2)
  );

  return {
    conversionRate,
    totalNewUsers,
    usersWhoOrdered,
  };
};
