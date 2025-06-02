"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Order_1 = require("../../model/Order");
const aggregate = async (obj) => {
    return await Order_1.OrderModel.aggregate(obj);
};
exports.default = aggregate;
//# sourceMappingURL=aggregate.js.map