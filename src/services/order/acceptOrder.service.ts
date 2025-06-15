import OrderRepo from '../../database/repository/OrderRepo';
import { BadRequestError } from '../../core/ApiError';
import ProductRepo from '../../database/repository/ProductRepo';
import { OrderStatus } from '../../database/model/Order';
import IStore from '../../database/model/Store';

interface updateParams {
  id: string;
  body: any;
}

export const acceptOrder = async ({ id, body }: updateParams) => {
  let order = await OrderRepo.findById(id);
  if (!order) throw new BadRequestError('Order not found');
  await Promise.all(
    body.items.forEach(async (item: any) => {
      let product = await ProductRepo.findById(item.productId, {
        populate: 'stores.store',
      });
      product?.stores.forEach((storeItem) => {
        if ((storeItem.store as IStore)._id.toString() === item.storeId) {
          storeItem.quantity -= item.quantity;
          //
          const itemIndex = order!.items.findIndex(
            (item: any) => item.product._id.toString() === item.productId
          );
          if (itemIndex !== -1) {
            order!.items[itemIndex].store = storeItem.store;
          }
          //
        }
      });
      await product?.save();
    })
  );
  order.status = OrderStatus.ACCEPTED;
  await order.save();
  return order;
};
