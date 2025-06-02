"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaxDiscountedPrice = void 0;
const Discount_1 = require("../../database/model/Discount");
const DiscountRepo_1 = __importDefault(require("../../database/repository/DiscountRepo"));
const extractTargetIds = (product) => {
    var _a;
    const targetIds = new Set();
    if (product === null || product === void 0 ? void 0 : product._id) {
        targetIds.add(product._id);
    }
    if ((_a = product === null || product === void 0 ? void 0 : product.category) === null || _a === void 0 ? void 0 : _a._id) {
        targetIds.add(product.category._id);
    }
    return Array.from(targetIds);
};
const calculateMaxDiscount = (product, discounts) => {
    if (!discounts.length) {
        return product === null || product === void 0 ? void 0 : product.price;
    }
    const originalPrice = product === null || product === void 0 ? void 0 : product.price;
    let maxDiscount = 0;
    let finalPrice = originalPrice;
    discounts.forEach((discount) => {
        let discountedPrice = originalPrice;
        if (discount.type === Discount_1.DiscountType.PERCENTAGE) {
            const discountAmount = originalPrice * (discount.amount / 100);
            discountedPrice = originalPrice - discountAmount;
        }
        else if (discount.type === Discount_1.DiscountType.AMOUNT) {
            discountedPrice = originalPrice - discount.amount;
        }
        // Ensure price doesn't go below 0
        discountedPrice = Math.max(0, discountedPrice);
        // If this discount results in a lower price (bigger discount), update our tracking variables
        if (originalPrice - discountedPrice > maxDiscount) {
            maxDiscount = originalPrice - discountedPrice;
            finalPrice = discountedPrice;
        }
    });
    return Number(finalPrice.toFixed(2));
};
async function getMaxDiscountedPrice(product) {
    const targetIds = extractTargetIds(product);
    if (targetIds.length > 0) {
        const currentDate = new Date();
        const discounts = await DiscountRepo_1.default.findAllNotPaginated({
            $and: [
                { isActive: true },
                { startDate: { $lte: currentDate } },
                { endDate: { $gte: currentDate } },
                {
                    $or: [
                        { 'target.categoryId': { $in: targetIds } },
                        { 'target.productId': { $in: targetIds } },
                    ],
                },
            ],
        });
        if (discounts.length > 0)
            return calculateMaxDiscount(product, discounts);
        return product.price;
    }
    return product.price;
}
exports.getMaxDiscountedPrice = getMaxDiscountedPrice;
//# sourceMappingURL=getMaxDiscount.js.map