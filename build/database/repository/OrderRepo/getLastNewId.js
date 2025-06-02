"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Order_1 = require("../../model/Order");
const getLastNewId = () => {
    return Order_1.OrderModel.findOne().sort({ newId: -1 }).exec();
};
exports.default = getLastNewId;
//# sourceMappingURL=getLastNewId.js.map