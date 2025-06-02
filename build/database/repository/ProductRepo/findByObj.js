"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = require("../../model/Product");
const findByObj = (obj) => {
    return Product_1.ProductModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map