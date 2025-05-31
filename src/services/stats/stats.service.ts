import { ObjectId } from 'mongoose';
import { averageBasketSize } from './averageBasketSize.service';
import { bestAndLeastSelling } from './bestAndLeastSelling.service';
import { conversionRate } from './conversionRate.service';
import { totalRevenue } from './totalRevenue.service';

export interface statsParams {
  startDate: Date;
  endDate: Date;
  deliveryGuyId?: ObjectId;
}

export const stats = async ({ startDate, endDate }: statsParams) => {
  const TotalRevenue = await totalRevenue({ startDate, endDate });
  const AverageBasketSize = await averageBasketSize({ startDate, endDate });
  const ConversionRate = await conversionRate({ startDate, endDate });
  const BestAndLeastSelling = await bestAndLeastSelling({ startDate, endDate });

  return {
    TotalRevenue,
    AverageBasketSize,
    ConversionRate,
    BestAndLeastSelling,
  };
};
