"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PaymentMethod_1 = require("../../model/PaymentMethod");
const remove = async (id) => {
    return await PaymentMethod_1.PaymentMethodModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map