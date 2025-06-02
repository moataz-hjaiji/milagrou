"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = require("../../model/Product");
const create = async (obj) => {
    return await Product_1.ProductModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map