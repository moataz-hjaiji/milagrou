"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PaymentMethod_1 = require("../../model/PaymentMethod");
const create = async (obj) => {
    return await PaymentMethod_1.PaymentMethodModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map