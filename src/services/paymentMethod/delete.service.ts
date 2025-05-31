import PaymentMethodRepo from '../../database/repository/PaymentMethodRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const paymentMethod = await PaymentMethodRepo.remove(id);
  if (!paymentMethod) throw new BadRequestError('PaymentMethod not found');
};
