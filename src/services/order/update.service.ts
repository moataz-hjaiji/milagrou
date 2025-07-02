import OrderRepo from '../../database/repository/OrderRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const order = await OrderRepo.update(id, body);
  if (!order) throw new BadRequestError('order not found');
  return order;
};
