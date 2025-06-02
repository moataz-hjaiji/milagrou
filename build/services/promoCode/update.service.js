"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const PromoCodeRepo_1 = __importDefault(require("../../database/repository/PromoCodeRepo"));
const ApiError_1 = require("../../core/ApiError");
const update = async ({ id, body }) => {
    if (body.code) {
        const checkPromoCode = await PromoCodeRepo_1.default.findByObj({ code: body.code });
        if (checkPromoCode)
            throw new ApiError_1.BadRequestError('Promo code with that code already exists');
    }
    const promoCode = await PromoCodeRepo_1.default.update(id, body);
    if (!promoCode)
        throw new ApiError_1.BadRequestError('promoCode not found');
    return promoCode;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map