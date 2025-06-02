"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const PromoCodeRepo_1 = __importDefault(require("../../database/repository/PromoCodeRepo"));
const ApiError_1 = require("../../core/ApiError");
const remove = async (id) => {
    const promoCode = await PromoCodeRepo_1.default.remove(id);
    if (!promoCode)
        throw new ApiError_1.BadRequestError('PromoCode not found');
};
exports.remove = remove;
//# sourceMappingURL=delete.service.js.map