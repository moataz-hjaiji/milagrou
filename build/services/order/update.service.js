"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const OrderRepo_1 = __importDefault(require("../../database/repository/OrderRepo"));
const ApiError_1 = require("../../core/ApiError");
const notif_1 = require("../../helpers/notif");
const update = async ({ id, body }) => {
    const order = await OrderRepo_1.default.update(id, body);
    if (!order)
        throw new ApiError_1.BadRequestError('order not found');
    switch (body.status) {
        case "ACCEPTED" /* OrderStatus.ACCEPTED */:
            await (0, notif_1.sendNotifUser)(order.userId.toString(), {
                data: {
                    title: 'Commande acceptée',
                    body: `Votre commande est acceptée`,
                    orderId: order._id,
                },
            });
            break;
        case "PREPARING" /* OrderStatus.PREPARING */:
            await (0, notif_1.sendNotifUser)(order.userId.toString(), {
                data: {
                    title: 'Commande en préparation',
                    body: `Votre commande est en préparation.`,
                    orderId: order._id,
                },
            });
            break;
        case "PREPARED" /* OrderStatus.PREPARED */:
            await (0, notif_1.sendNotifUser)(order.userId.toString(), {
                data: {
                    title: 'Commande prête',
                    body: `Votre commande est prête à être récupérée.`,
                    orderId: order._id,
                },
            });
            break;
        case "DELIVERING" /* OrderStatus.DELIVERING */:
            await (0, notif_1.sendNotifUser)(order.userId.toString(), {
                data: {
                    title: 'Commande en cours de livraison',
                    body: `Votre commande arrivera bientôt.`,
                    orderId: order._id,
                },
            });
            break;
        case "DELIVERED" /* OrderStatus.DELIVERED */:
            await (0, notif_1.sendNotifUser)(order.userId.toString(), {
                data: {
                    title: 'Commande livrée',
                    body: `Votre commande a été livrée.`,
                    orderId: order._id,
                },
            });
            break;
    }
    if (body.deliveryGuyId) {
        await (0, notif_1.sendNotifUser)(body.deliveryGuyId, {
            data: {
                title: 'Commande assignée',
                body: `Une commande vous a été attribuée.`,
                orderId: order._id,
            },
        });
    }
    return order;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map