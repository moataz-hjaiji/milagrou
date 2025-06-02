"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cart_1 = require("../../model/Cart");
const findByObj = (obj) => {
    return Cart_1.CartModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map