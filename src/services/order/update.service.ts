import OrderRepo from '../../database/repository/OrderRepo';
import { BadRequestError } from '../../core/ApiError';
import { sendNotifUser } from '../../helpers/notif';
import { OrderStatus } from '../../database/model/Order';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const order = await OrderRepo.update(id, body);
  if (!order) throw new BadRequestError('order not found');
  switch (body.status) {
    case OrderStatus.ACCEPTED:
      await sendNotifUser(order.userId.toString(), {
        data: {
          title: 'Commande acceptée',
          body: `Votre commande est acceptée`,
          orderId: order._id,
        },
      });
      break;
    case OrderStatus.PREPARING:
      await sendNotifUser(order.userId.toString(), {
        data: {
          title: 'Commande en préparation',
          body: `Votre commande est en préparation.`,
          orderId: order._id,
        },
      });
      break;
    case OrderStatus.PREPARED:
      await sendNotifUser(order.userId.toString(), {
        data: {
          title: 'Commande prête',
          body: `Votre commande est prête à être récupérée.`,
          orderId: order._id,
        },
      });
      break;
    case OrderStatus.DELIVERING:
      await sendNotifUser(order.userId.toString(), {
        data: {
          title: 'Commande en cours de livraison',
          body: `Votre commande arrivera bientôt.`,
          orderId: order._id,
        },
      });
      break;
    case OrderStatus.DELIVERED:
      await sendNotifUser(order.userId.toString(), {
        data: {
          title: 'Commande livrée',
          body: `Votre commande a été livrée.`,
          orderId: order._id,
        },
      });
      break;
  }
  if (body.deliveryGuyId) {
    await sendNotifUser(body.deliveryGuyId, {
      data: {
        title: 'Commande assignée',
        body: `Une commande vous a été attribuée.`,
        orderId: order._id,
      },
    });
  }
  return order;
};
