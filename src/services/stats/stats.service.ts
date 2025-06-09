import { totalRevenue } from './totalRevenue.service';
import { totalOrders } from './totalOrders.service';
import { totalCompeletedOrders } from './totalCompletedOrders.service';
import { totalPendingOrders } from './totalPendingOrders.service';

export interface statsParams {
  startDate: Date;
  endDate: Date;
}

export const stats = async ({ startDate, endDate }: statsParams) => {
  const totalRevenueValue = await totalRevenue({ startDate, endDate });
  const totalOrdersValue = await totalOrders({ startDate, endDate });
  const totalCompeletedOrdersValue = await totalCompeletedOrders({
    startDate,
    endDate,
  });
  const totalPendingOrdersValue = await totalPendingOrders({
    startDate,
    endDate,
  });

  return {
    totalRevenueValue,
    totalOrdersValue,
    totalCompeletedOrdersValue,
    totalPendingOrdersValue,
  };
};
