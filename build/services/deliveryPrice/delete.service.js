"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const DeliveryPriceRepo_1 = __importDefault(require("../../database/repository/DeliveryPriceRepo"));
const ApiError_1 = require("../../core/ApiError");
const remove = async (id) => {
    const deliveryPrice = await DeliveryPriceRepo_1.default.remove(id);
    if (!deliveryPrice)
        throw new ApiError_1.BadRequestError('DeliveryPrice not found');
};
exports.remove = remove;
//# sourceMappingURL=delete.service.js.map