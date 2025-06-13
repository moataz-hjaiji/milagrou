import OrderRepo from '../../database/repository/OrderRepo';
import { BadRequestError } from '../../core/ApiError';
import ProductRepo from '../../database/repository/ProductRepo';
import { OrderStatus } from '../../database/model/Order';

interface updateParams {
  id: string;
  body: any;
}

export const acceptOrder = async ({ id, body }: updateParams) => {
  let order = await OrderRepo.findById(id);
  if (!order) throw new BadRequestError('Order not found');
  await Promise.all(
    body.items.map(async (item: any) => {
      let product = await ProductRepo.findById(item.productId);
      product?.stores.forEach((store) => {
        if (store.store === item.storeId) {
          store.quantity -= item.quantity;
        }
      });
      await product?.save();
    })
  );
  order.status = OrderStatus.ACCEPTED;
  await order.save();
  return order;
};
