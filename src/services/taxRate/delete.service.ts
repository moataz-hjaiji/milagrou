import TaxRateRepo from '../../database/repository/TaxRateRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const taxRate = await TaxRateRepo.remove(id);
  if (!taxRate) throw new BadRequestError('TaxRate not found');
};
