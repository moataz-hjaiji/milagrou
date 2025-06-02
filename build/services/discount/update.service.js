"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const DiscountRepo_1 = __importDefault(require("../../database/repository/DiscountRepo"));
const ApiError_1 = require("../../core/ApiError");
const update = async ({ id, body }) => {
    var _a, _b;
    if (body.isActive === true) {
        const discount = await DiscountRepo_1.default.findById(id);
        if (!discount)
            throw new ApiError_1.BadRequestError('discount not found');
        const targetId = (_b = (_a = discount.target.categoryId) !== null && _a !== void 0 ? _a : discount.target.productId) !== null && _b !== void 0 ? _b : null;
        const activeDiscountCheck = await DiscountRepo_1.default.findByObj({
            $and: [
                { isActive: true },
                {
                    $or: [
                        { 'target.categoryId': targetId },
                        { 'target.productId': targetId },
                    ],
                },
            ],
        });
        if (activeDiscountCheck)
            throw new ApiError_1.BadRequestError('this target already has an active discount');
    }
    const discount = await DiscountRepo_1.default.update(id, body);
    return discount;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map