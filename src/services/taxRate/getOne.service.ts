import TaxRateRepo from '../../database/repository/TaxRateRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const taxRate = await TaxRateRepo.findById(id, query);
  if (!taxRate) throw new BadRequestError('TaxRate not found');
  return taxRate;
};
