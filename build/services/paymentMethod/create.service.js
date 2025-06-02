"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const ApiError_1 = require("../../core/ApiError");
const PaymentMethodRepo_1 = __importDefault(require("../../database/repository/PaymentMethodRepo"));
const create = async ({ body }) => {
    const paymentMethod = await PaymentMethodRepo_1.default.create(body);
    if (!paymentMethod)
        throw new ApiError_1.BadRequestError('error creating paymentMethod');
    return paymentMethod;
};
exports.create = create;
//# sourceMappingURL=create.service.js.map