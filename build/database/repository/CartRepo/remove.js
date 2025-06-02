"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cart_1 = require("../../model/Cart");
const remove = async (id) => {
    return await Cart_1.CartModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map