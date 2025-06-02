"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PaymentMethod_1 = require("../../model/PaymentMethod");
const update = async (id, obj) => {
    return await PaymentMethod_1.PaymentMethodModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map