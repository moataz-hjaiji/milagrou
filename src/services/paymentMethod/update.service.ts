import PaymentMethodRepo from '../../database/repository/PaymentMethodRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const paymentMethod = await PaymentMethodRepo.update(id, body);
  if (!paymentMethod) throw new BadRequestError('paymentMethod not found');
  return paymentMethod;
};
