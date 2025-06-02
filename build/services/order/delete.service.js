"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const OrderRepo_1 = __importDefault(require("../../database/repository/OrderRepo"));
const ApiError_1 = require("../../core/ApiError");
const remove = async (id) => {
    const order = await OrderRepo_1.default.remove(id);
    if (!order)
        throw new ApiError_1.BadRequestError('Order not found');
};
exports.remove = remove;
//# sourceMappingURL=delete.service.js.map