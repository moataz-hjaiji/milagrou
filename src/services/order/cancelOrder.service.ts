import OrderRepo from '../../database/repository/OrderRepo';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import { ObjectId } from 'mongoose';
import RoleRepo from '../../database/repository/RoleRepo';

import UserRepo from '../../database/repository/UserRepo';
import { sendNotifUser } from '../../helpers/notif';
import { OrderStatus } from '../../database/model/Order';

export const cancelOrder = async (id: string, userId: ObjectId) => {
  const order = await OrderRepo.findById(id);
  if (!order) throw new BadRequestError('order not found');
  if (order.userId.toString() !== userId.toString())
    throw new BadRequestError(
      'cant cancel order because it doesnt belong to you'
    );
  if (order.status !== OrderStatus.PENDING)
    throw new BadRequestError(
      'cant cancel order because its already being processed'
    );
  order.status = OrderStatus.CANCELED;
  await order.save();

  const roleAdmin = await RoleRepo.findByCode('admin');
  if (!roleAdmin) throw new NotFoundError('admin role not found');

  const admins = await UserRepo.findAllNotPaginated({
    roles: roleAdmin._id,
  });

  await Promise.all(
    admins.map(async (admin) => {
      await sendNotifUser(admin._id.toString(), {
        data: {
          title: 'Commande annulée',
          body: `Vous avez une commande annulée.`,
          orderId: order._id,
        },
      });
    })
  );
  return order;
};
