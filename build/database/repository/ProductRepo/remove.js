"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = require("../../model/Product");
const remove = async (id) => {
    return await Product_1.ProductModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map