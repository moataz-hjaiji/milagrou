"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Order_1 = require("../../model/Order");
const findByObj = (obj) => {
    return Order_1.OrderModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map