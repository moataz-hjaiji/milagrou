"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const DeliveryPriceRepo_1 = __importDefault(require("../../database/repository/DeliveryPriceRepo"));
const ApiError_1 = require("../../core/ApiError");
const getOne = async (id, query) => {
    const deliveryPrice = await DeliveryPriceRepo_1.default.findById(id, query);
    if (!deliveryPrice)
        throw new ApiError_1.BadRequestError('DeliveryPrice not found');
    return deliveryPrice;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map