"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const OrderRepo_1 = __importDefault(require("../../database/repository/OrderRepo"));
const ApiError_1 = require("../../core/ApiError");
const getOne = async (id, query) => {
    const order = await OrderRepo_1.default.findById(id, query);
    if (!order)
        throw new ApiError_1.BadRequestError('Order not found');
    return order;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map