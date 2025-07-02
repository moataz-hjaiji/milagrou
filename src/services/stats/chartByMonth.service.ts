import { OrderStatus, PaymentStatus } from '../../database/model/Order';
import OrderRepo from '../../database/repository/OrderRepo';
import UserRepo from '../../database/repository/UserRepo';

export const chartByMonth = async (startDate: Date, endDate: Date) => {
  const revenueAggregationResult = await OrderRepo.aggregate([
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

  let revenueResult;
  if (revenueAggregationResult.length === 0) {
    revenueResult = 0;
  } else {
    revenueResult = revenueAggregationResult[0].totalRevenue;
  }
  //

  const completedOrdersAggregationResult = await OrderRepo.aggregate([
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
        totalCompletedOrders: { $sum: 1 },
        totalRevenue: {
          $sum: '$orderPriceWithoutDeliveryPrice',
        },
      },
    },
  ]);
  let completedOrdersResult;
  if (completedOrdersAggregationResult.length === 0) {
    completedOrdersResult = {
      totalAcceptedOrders: 0,
      totalRevenue: 0,
    };
  } else {
    completedOrdersResult = {
      totalCompeletedOrders:
        completedOrdersAggregationResult[0].totalCompeletedOrders,
      totalRevenue: completedOrdersAggregationResult[0].totalRevenue,
    };
  }
  //

  const pendingOrdersAggregationResult = await OrderRepo.aggregate([
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
        totalRevenue: {
          $sum: '$orderPriceWithoutDeliveryPrice',
        },
      },
    },
  ]);
  let pendingOrdersResult;
  if (pendingOrdersAggregationResult.length === 0) {
    pendingOrdersResult = {
      totalPendingOrders: 0,
      totalRevenue: 0,
    };
  } else {
    pendingOrdersResult = {
      totalPendingOrders: pendingOrdersAggregationResult[0].totalPendingOrders,
      totalRevenue: pendingOrdersAggregationResult[0].totalRevenue,
    };
  }
  //

  const canceledOrdersAggregationResult = await OrderRepo.aggregate([
    {
      $match: {
        status: OrderStatus.CANCELED,
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
        totalCanceledOrders: { $sum: 1 },
        totalRevenue: {
          $sum: '$orderPriceWithoutDeliveryPrice',
        },
      },
    },
  ]);
  let canceledOrdersResult;
  if (canceledOrdersAggregationResult.length === 0) {
    canceledOrdersResult = {
      totalCanceledOrders: 0,
      totalRevenue: 0,
    };
  } else {
    canceledOrdersResult = {
      totalCanceledOrders:
        canceledOrdersAggregationResult[0].totalCanceledOrders,
      totalRevenue: canceledOrdersAggregationResult[0].totalRevenue,
    };
  }
  //

  const usersAggregationResult = await UserRepo.aggregate([
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
      $lookup: {
        from: 'Roles',
        localField: 'roles',
        foreignField: '_id',
        as: 'roleDetails',
      },
    },
    {
      $match: {
        'roleDetails.name': 'user',
      },
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        totalVerifiedUsers: {
          $sum: {
            $cond: [{ $eq: ['$verified', true] }, 1, 0],
          },
        },
      },
    },
  ]);

  let usersResult;
  if (usersAggregationResult.length === 0) {
    usersResult = {
      totalUsers: 0,
      totalVerifiedUsers: 0,
    };
  } else {
    usersResult = {
      totalUsers: usersAggregationResult[0].totalUsers,
      totalVerifiedUsers: usersAggregationResult[0].totalVerifiedUsers,
    };
  }

  return {
    revenueResult,
    completedOrdersResult,
    pendingOrdersResult,
    canceledOrdersResult,
    usersResult,
  };
};
