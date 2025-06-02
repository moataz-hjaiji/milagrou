"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = require("../../model/Product");
const update = async (id, obj) => {
    return await Product_1.ProductModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map