import TaxRateRepo from '../../database/repository/TaxRateRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const taxRates = await TaxRateRepo.findAll(options, query);
  const { docs, ...meta } = taxRates;

  return {
    meta,
    docs,
  };
};
