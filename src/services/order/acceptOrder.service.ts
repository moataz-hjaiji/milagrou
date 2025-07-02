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
    body.items.map(async (bodyItem: any) => {
      let product = await ProductRepo.findById(bodyItem.productId, {
        populate: 'stores.store',
      });
      product?.stores.forEach((storeItem) => {
        if ((storeItem.store as IStore)._id.toString() === bodyItem.storeId) {
          storeItem.quantity -= bodyItem.quantity;
          //
          const itemIndex = order!.items.findIndex(
            (orderItem: any) =>
              orderItem.product._id.toString() === bodyItem.productId
          );
          if (itemIndex !== -1) {
            order!.items[itemIndex].store = storeItem.store;
            console.log('here');
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
