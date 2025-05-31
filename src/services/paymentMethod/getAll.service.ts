import PaymentMethodRepo from '../../database/repository/PaymentMethodRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const paymentMethods = await PaymentMethodRepo.findAll(options, query);
  const { docs, ...meta } = paymentMethods;

  return {
    meta,
    docs,
  };
};
