import { totalRevenue } from './totalRevenue.service';
import { totalOrders } from './totalOrders.service';
import { totalCompeletedOrders } from './totalCompletedOrders.service';
import { totalPendingOrders } from './totalPendingOrders.service';
import { totalAcceptedOrders } from './totalAcceptedOrders.service';
import { todayOrders } from './todayOrders.service';
import { totalUsers } from './totalUsers.service';
import { totalCanceledOrders } from './totalCanceledOrders.service';
import { chartByMonth } from './chartByMonth.service';

export interface statsParams {
  startDate: Date;
  endDate: Date;
  types?: string[];
  year?: number;
}

export const stats = async ({
  startDate,
  endDate,
  types,
  year,
}: statsParams) => {
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

  const totalAcceptedOrdersValue = await totalAcceptedOrders({
    startDate,
    endDate,
    types,
  });

  const totalCanceledOrdersValue = await totalCanceledOrders({
    startDate,
    endDate,
    types,
  });

  const todayOrdersValue = await todayOrders();
  const totalUsersValue = await totalUsers();
  let chartsStatsValue: any = [];

  if (year) {
    const months = [];
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

      months.push({
        name: startDate.toLocaleString('default', { month: 'long' }),
        start: startDate,
        end: endDate,
      });
    }

    const chartsStats = await Promise.all(
      months.map(async (month) => {
        const result = await chartByMonth(month.start, month.end);
        return {
          [month.name]: result,
        };
      })
    );
    chartsStatsValue = chartsStats;
  }

  return {
    totalRevenueValue,
    totalOrdersValue,
    totalCompeletedOrdersValue,
    totalPendingOrdersValue,
    totalAcceptedOrdersValue,
    totalCanceledOrdersValue,
    todayOrdersValue,
    totalUsersValue,
    chartsStatsValue,
  };
};
