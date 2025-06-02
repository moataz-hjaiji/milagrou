"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Order_1 = require("../../model/Order");
const create = async (obj) => {
    return await Order_1.OrderModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map