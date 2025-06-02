"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const PaymentMethodRepo_1 = __importDefault(require("../../database/repository/PaymentMethodRepo"));
const ApiError_1 = require("../../core/ApiError");
const update = async ({ id, body }) => {
    const paymentMethod = await PaymentMethodRepo_1.default.update(id, body);
    if (!paymentMethod)
        throw new ApiError_1.BadRequestError('paymentMethod not found');
    return paymentMethod;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map