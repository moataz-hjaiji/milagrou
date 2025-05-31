import OrderRepo from '../../database/repository/OrderRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const order = await OrderRepo.remove(id);
  if (!order) throw new BadRequestError('Order not found');
};
