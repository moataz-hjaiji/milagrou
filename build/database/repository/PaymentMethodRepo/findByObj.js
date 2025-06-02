"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PaymentMethod_1 = require("../../model/PaymentMethod");
const findByObj = (obj) => {
    return PaymentMethod_1.PaymentMethodModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map