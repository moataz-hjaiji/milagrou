import OrderRepo from '../../database/repository/OrderRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const order = await OrderRepo.findById(id, query);
  if (!order) throw new BadRequestError('Order not found');
  return order;
};
