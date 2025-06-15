import { totalRevenue } from './totalRevenue.service';
import { totalOrders } from './totalOrders.service';
import { totalCompeletedOrders } from './totalCompletedOrders.service';
import { totalPendingOrders } from './totalPendingOrders.service';

export interface statsParams {
  startDate: Date;
  endDate: Date;
  types?: string[];
}

export const stats = async ({ startDate, endDate, types }: statsParams) => {
  const totalRevenueValue = await totalRevenue({ startDate, endDate, types });
  const totalOrdersValue = await totalOrders({ startDate, endDate, types });
  const totalCompeletedOrdersValue = await totalCompeletedOrders({
    startDate,
    endDate,
    types,
  });
  const totalPendingOrdersValue = await totalPendingOrders({
    startDate,
    endDate,
    types,
  });

  return {
    totalRevenueValue,
    totalOrdersValue,
    totalCompeletedOrdersValue,
    totalPendingOrdersValue,
  };
};
