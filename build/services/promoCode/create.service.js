"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const ApiError_1 = require("../../core/ApiError");
const PromoCodeRepo_1 = __importDefault(require("../../database/repository/PromoCodeRepo"));
const create = async ({ body }) => {
    const checkPromoCode = await PromoCodeRepo_1.default.findByObj({ code: body.code });
    if (checkPromoCode)
        throw new ApiError_1.BadRequestError('Promo code with that code already exists');
    const promoCode = await PromoCodeRepo_1.default.create(body);
    if (!promoCode)
        throw new ApiError_1.BadRequestError('error creating promoCode');
    return promoCode;
};
exports.create = create;
//# sourceMappingURL=create.service.js.map