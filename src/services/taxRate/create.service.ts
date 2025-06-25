import { BadRequestError } from '../../core/ApiError';
import TaxRateRepo from '../../database/repository/TaxRateRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  const taxRateCheck = await TaxRateRepo.findByObj({});
  if (taxRateCheck) throw new BadRequestError('tax rate aleardy exist');
  const taxRate = await TaxRateRepo.create(body);
  if (!taxRate) throw new BadRequestError('error creating taxRate');
  return taxRate;
};
