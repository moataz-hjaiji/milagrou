"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const DeliveryPriceRepo_1 = __importDefault(require("../../database/repository/DeliveryPriceRepo"));
const ApiError_1 = require("../../core/ApiError");
const update = async ({ id, body }) => {
    if (body.isActive === true) {
        const deliveryPriceCheck = await DeliveryPriceRepo_1.default.findByObj({
            isActive: true,
        });
        if (deliveryPriceCheck)
            throw new ApiError_1.BadRequestError('an active delivery price already exists');
    }
    const deliveryPrice = await DeliveryPriceRepo_1.default.update(id, body);
    if (!deliveryPrice)
        throw new ApiError_1.BadRequestError('deliveryPrice not found');
    return deliveryPrice;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map