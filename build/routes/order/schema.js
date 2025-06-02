"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("@hapi/joi"));
const validator_1 = require("../../helpers/utils/validator");
exports.default = {
    param: joi_1.default.object().keys({
        id: (0, validator_1.JoiObjectId)().required(),
    }),
    checkout: joi_1.default.object().keys({
        deliveryType: joi_1.default.string().valid("DELIVERY" /* DeliveryType.DELIVERY */, "PICKUP" /* DeliveryType.PICKUP */),
        paymentMethodId: (0, validator_1.JoiObjectId)().required(),
        addressId: (0, validator_1.JoiObjectId)(),
        code: joi_1.default.string(),
    }),
    update: joi_1.default.object().keys({
        deliveryGuyId: joi_1.default.alternatives().try((0, validator_1.JoiObjectId)(), joi_1.default.allow(null)),
        deliveryGuyacceptance: joi_1.default.boolean(),
        status: joi_1.default.string().valid("ACCEPTED" /* OrderStatus.ACCEPTED */, "DELIVERED" /* OrderStatus.DELIVERED */, "DELIVERING" /* OrderStatus.DELIVERING */, "PREPARING" /* OrderStatus.PREPARING */, "PREPARED" /* OrderStatus.PREPARED */),
    }),
};
//# sourceMappingURL=schema.js.map