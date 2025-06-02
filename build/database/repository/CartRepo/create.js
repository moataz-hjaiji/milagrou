"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cart_1 = require("../../model/Cart");
const create = async (obj) => {
    return await Cart_1.CartModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map