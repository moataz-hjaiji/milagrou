import PaymentMethodRepo from '../../database/repository/PaymentMethodRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const paymentMethod = await PaymentMethodRepo.findById(id, query);
  if (!paymentMethod) throw new BadRequestError('PaymentMethod not found');
  return paymentMethod;
};
