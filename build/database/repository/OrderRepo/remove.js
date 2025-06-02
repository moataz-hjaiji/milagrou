"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Order_1 = require("../../model/Order");
const remove = async (id) => {
    return await Order_1.OrderModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map