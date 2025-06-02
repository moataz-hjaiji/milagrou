"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DeliveryPrice_1 = require("../../model/DeliveryPrice");
const findByObj = (obj) => {
    return DeliveryPrice_1.DeliveryPriceModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map