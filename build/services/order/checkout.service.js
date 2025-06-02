"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkout = void 0;
const ApiError_1 = require("../../core/ApiError");
const CartRepo_1 = __importDefault(require("../../database/repository/CartRepo"));
const OrderRepo_1 = __importDefault(require("../../database/repository/OrderRepo"));
const RoleRepo_1 = __importDefault(require("../../database/repository/RoleRepo"));
const UserRepo_1 = __importDefault(require("../../database/repository/UserRepo"));
const notif_1 = require("../../helpers/notif");
const calculateOrderPrices_1 = require("./calculateOrderPrices");
const PromoCodeRepo_1 = __importDefault(require("../../database/repository/PromoCodeRepo"));
const Discount_1 = require("../../database/model/Discount");
const checkout = async ({ userId, deliveryType, paymentMethodId, addressId, code, }) => {
    const cart = await CartRepo_1.default.findByObj({ userId });
    if (!cart || cart.items.length === 0)
        throw new ApiError_1.BadRequestError('your cart is empty');
    await cart.populate([
        {
            path: 'items.product',
            populate: [
                { path: 'productPrice', select: ' -createdAt -updatedAt' },
                {
                    path: 'supplementArray.supplementCategory',
                    select: '-description -createdAt -updatedAt',
                },
                {
                    path: 'supplementArray.supplements.supplement',
                    select: '-description -createdAt -updatedAt',
                },
                {
                    path: 'subCategory',
                    populate: [
                        {
                            path: 'category',
                            populate: [
                                { path: 'menu', select: '-description -createdAt -updatedAt' },
                            ],
                            select: '-description -createdAt -updatedAt',
                        },
                    ],
                    select: '-description -createdAt -updatedAt',
                },
                {
                    path: 'category',
                    populate: [
                        { path: 'menu', select: '-description -createdAt -updatedAt' },
                    ],
                    select: '-description -createdAt -updatedAt',
                },
            ],
            select: '-createdAt -updatedAt',
        },
        {
            path: 'items.selectedSupplements',
            populate: [
                {
                    path: 'supplementCategory',
                    select: '-description -createdAt -updatedAt',
                },
                {
                    path: 'supplements.supplement',
                    select: '-description -createdAt -updatedAt',
                },
            ],
        },
    ]);
    const items = await (0, calculateOrderPrices_1.calculateOrderPrices)(cart.items.toObject());
    let orderPriceWithoutDeliveryPrice = items.reduce((sum, item) => sum + item.itemPrice, 0);
    let promoCode;
    if (code) {
        const currentDate = new Date();
        const promo = await PromoCodeRepo_1.default.findByObj({
            $and: [
                { code },
                { isActive: true },
                { startDate: { $lte: currentDate } },
                { endDate: { $gte: currentDate } },
            ],
        });
        if (!promo)
            throw new ApiError_1.BadRequestError('invalid promo code');
        if (promo.maxUsage && promo.actualUsage >= promo.maxUsage)
            throw new ApiError_1.BadRequestError(`promo code reached it's max usage limit `);
        if (promo.oneTimeUse) {
            const exists = promo
                .users.map((id) => id.toString())
                .includes(userId.toString());
            if (exists)
                throw new ApiError_1.BadRequestError('you already used this promo code');
        }
        if (promo.type === Discount_1.DiscountType.PERCENTAGE) {
            orderPriceWithoutDeliveryPrice =
                orderPriceWithoutDeliveryPrice -
                    (orderPriceWithoutDeliveryPrice * promo.amount) / 100;
        }
        else if (promo.type === Discount_1.DiscountType.AMOUNT) {
            orderPriceWithoutDeliveryPrice =
                orderPriceWithoutDeliveryPrice - promo.amount;
        }
        orderPriceWithoutDeliveryPrice = Math.max(0, orderPriceWithoutDeliveryPrice);
        promoCode = promo;
    }
    let orderPrice = orderPriceWithoutDeliveryPrice;
    const orderNewIdCheck = await OrderRepo_1.default.getLastNewId();
    let newId = 1;
    if (orderNewIdCheck === null || orderNewIdCheck === void 0 ? void 0 : orderNewIdCheck.newId)
        newId = (orderNewIdCheck === null || orderNewIdCheck === void 0 ? void 0 : orderNewIdCheck.newId) + 1;
    const order = await OrderRepo_1.default.create({
        userId,
        deliveryType,
        paymentMethodId,
        addressId,
        status: "PENDING" /* OrderStatus.PENDING */,
        items,
        orderPrice,
        orderPriceWithoutDeliveryPrice,
        newId,
        promoCodeId: promoCode === null || promoCode === void 0 ? void 0 : promoCode._id,
    });
    if (promoCode) {
        ++promoCode.actualUsage;
        await promoCode.save();
    }
    cart.items = [];
    await cart.save();
    const roleAdmin = await RoleRepo_1.default.findByCode('admin');
    if (!roleAdmin)
        throw new ApiError_1.NotFoundError('admin role not found');
    const admins = await UserRepo_1.default.findAllNotPaginated({
        roles: roleAdmin._id,
    });
    await Promise.all(admins.map(async (admin) => {
        await (0, notif_1.sendNotifUser)(admin._id.toString(), {
            data: {
                title: 'Nouvelle commande',
                body: `Vous avez une nouvelle commande.`,
                orderId: order._id,
            },
        });
    }));
    return order;
};
exports.checkout = checkout;
//# sourceMappingURL=checkout.service.js.map