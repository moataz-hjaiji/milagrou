import { BadRequestError } from '../../core/ApiError';
import PaymentMethodRepo from '../../database/repository/PaymentMethodRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  const paymentMethod = await PaymentMethodRepo.create(body);
  if (!paymentMethod) throw new BadRequestError('error creating paymentMethod');
  return paymentMethod;
};
