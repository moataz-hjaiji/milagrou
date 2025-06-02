"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const ApiError_1 = require("../../core/ApiError");
const DiscountRepo_1 = __importDefault(require("../../database/repository/DiscountRepo"));
const create = async ({ body }) => {
    var _a, _b;
    if (body.isActive === true) {
        const targetId = (_b = (_a = body.target.categoryId) !== null && _a !== void 0 ? _a : body.target.productId) !== null && _b !== void 0 ? _b : null;
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
    const discount = await DiscountRepo_1.default.create(body);
    if (!discount)
        throw new ApiError_1.BadRequestError('error creating discount');
    return discount;
};
exports.create = create;
//# sourceMappingURL=create.service.js.map