"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const PaymentMethodRepo_1 = __importDefault(require("../../database/repository/PaymentMethodRepo"));
const ApiError_1 = require("../../core/ApiError");
const getOne = async (id, query) => {
    const paymentMethod = await PaymentMethodRepo_1.default.findById(id, query);
    if (!paymentMethod)
        throw new ApiError_1.BadRequestError('PaymentMethod not found');
    return paymentMethod;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map