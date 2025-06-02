"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = void 0;
const OrderRepo_1 = __importDefault(require("../../database/repository/OrderRepo"));
const ApiError_1 = require("../../core/ApiError");
const RoleRepo_1 = __importDefault(require("../../database/repository/RoleRepo"));
const UserRepo_1 = __importDefault(require("../../database/repository/UserRepo"));
const notif_1 = require("../../helpers/notif");
const cancelOrder = async (id, userId) => {
    const order = await OrderRepo_1.default.findById(id);
    if (!order)
        throw new ApiError_1.BadRequestError('order not found');
    if (order.userId.toString() !== userId.toString())
        throw new ApiError_1.BadRequestError('cant cancel order because it doesnt belong to you');
    if (order.status !== "PENDING" /* OrderStatus.PENDING */)
        throw new ApiError_1.BadRequestError('cant cancel order because its already being processed');
    order.status = "CANCELED" /* OrderStatus.CANCELED */;
    await order.save();
    const roleAdmin = await RoleRepo_1.default.findByCode('admin');
    if (!roleAdmin)
        throw new ApiError_1.NotFoundError('admin role not found');
    const admins = await UserRepo_1.default.findAllNotPaginated({
        roles: roleAdmin._id,
    });
    await Promise.all(admins.map(async (admin) => {
        await (0, notif_1.sendNotifUser)(admin._id.toString(), {
            data: {
                title: 'Commande annulée',
                body: `Vous avez une commande annulée.`,
                orderId: order._id,
            },
        });
    }));
    return order;
};
exports.cancelOrder = cancelOrder;
//# sourceMappingURL=cancelOrder.service.js.map