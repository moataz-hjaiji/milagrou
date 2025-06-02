"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPromoCode = void 0;
const ApiError_1 = require("../../core/ApiError");
const PromoCodeRepo_1 = __importDefault(require("../../database/repository/PromoCodeRepo"));
const CartRepo_1 = __importDefault(require("../../database/repository/CartRepo"));
const calculateCartPrices_1 = require("../cart/calculateCartPrices");
const Discount_1 = require("../../database/model/Discount");
const verifyPromoCode = async ({ userId, code, }) => {
    const cart = await CartRepo_1.default.findByObj({ userId });
    if (!cart)
        throw new ApiError_1.BadRequestError('your cart is empty');
    const currentDate = new Date();
    const promoCode = await PromoCodeRepo_1.default.findByObj({
        $and: [
            { code },
            { isActive: true },
            { startDate: { $lte: currentDate } },
            { endDate: { $gte: currentDate } },
        ],
    });
    if (!promoCode)
        throw new ApiError_1.BadRequestError('invalid promo code');
    if (promoCode.maxUsage && promoCode.actualUsage >= promoCode.maxUsage)
        throw new ApiError_1.BadRequestError(`promo code reached it's max usage limit `);
    if (promoCode.oneTimeUse) {
        const exists = promoCode
            .users.map((id) => id.toString())
            .includes(userId.toString());
        if (exists)
            throw new ApiError_1.BadRequestError('you already used this promo code');
    }
    let totalCartPrice = 0;
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
    let result = await (0, calculateCartPrices_1.calculateItemPrices)(cart.toObject());
    result.items.map((item) => {
        totalCartPrice += item.itemPrice.totalPrice;
    });
    let priceAfterPromoCode = totalCartPrice;
    if (promoCode.type === Discount_1.DiscountType.PERCENTAGE) {
        priceAfterPromoCode =
            totalCartPrice - (totalCartPrice * promoCode.amount) / 100;
    }
    else if (promoCode.type === Discount_1.DiscountType.AMOUNT) {
        priceAfterPromoCode = totalCartPrice - promoCode.amount;
    }
    priceAfterPromoCode = Math.max(0, priceAfterPromoCode);
    result.totalCartPrice = totalCartPrice;
    result.priceAfterPromoCode = priceAfterPromoCode;
    return result;
};
exports.verifyPromoCode = verifyPromoCode;
//# sourceMappingURL=verifyPromoCode.service.js.map