import { OrderStatus } from '../../database/model/Order';
import OrderRepo from '../../database/repository/OrderRepo';
import { statsParams } from './stats.service';

export const bestAndLeastSelling = async ({
  startDate,
  endDate,
}: statsParams) => {
  const baseAggregation = [
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
    // Unwind items array to work with individual items
    { $unwind: '$items' },
    // Group by product and sum quantities
    {
      $group: {
        _id: '$items.product',
        totalQuantitySold: { $sum: '$items.quantity' },
      },
    },
    // Lookup product details
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    // Unwind product details
    {
      $unwind: '$productDetails',
    },
    // Project final format
    {
      $project: {
        _id: 1,
        product: '$productDetails',
        totalQuantitySold: 1,
      },
    },
  ];

  // Get top 5 selling products
  const topSelling = await OrderRepo.aggregate([
    ...baseAggregation,
    { $sort: { totalQuantitySold: -1 } },
    { $limit: 5 },
  ]);

  // Get least 5 selling products
  const leastSelling = await OrderRepo.aggregate([
    ...baseAggregation,
    { $sort: { totalQuantitySold: 1 } },
    { $limit: 5 },
  ]);

  return {
    topSelling: topSelling.map((item) => ({
      product: {
        _id: item.product._id,
        name: item.product.name,
        // Add other product fields you need
      },
      totalQuantitySold: item.totalQuantitySold,
    })),
    leastSelling: leastSelling.map((item) => ({
      product: {
        _id: item.product._id,
        name: item.product.name,
        // Add other product fields you need
      },
      totalQuantitySold: item.totalQuantitySold,
    })),
  };
};
