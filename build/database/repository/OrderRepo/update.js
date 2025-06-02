"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Order_1 = require("../../model/Order");
const update = async (id, obj) => {
    return await Order_1.OrderModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map