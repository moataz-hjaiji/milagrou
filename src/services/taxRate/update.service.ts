import TaxRateRepo from '../../database/repository/TaxRateRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const taxRate = await TaxRateRepo.update(id, body);
  if (!taxRate) throw new BadRequestError('taxRate not found');
  return taxRate;
};
