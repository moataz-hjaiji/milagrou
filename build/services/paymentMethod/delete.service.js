"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const PaymentMethodRepo_1 = __importDefault(require("../../database/repository/PaymentMethodRepo"));
const ApiError_1 = require("../../core/ApiError");
const remove = async (id) => {
    const paymentMethod = await PaymentMethodRepo_1.default.remove(id);
    if (!paymentMethod)
        throw new ApiError_1.BadRequestError('PaymentMethod not found');
};
exports.remove = remove;
//# sourceMappingURL=delete.service.js.map