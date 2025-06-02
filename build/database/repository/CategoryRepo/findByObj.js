"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Category_1 = require("../../model/Category");
const findByObj = (obj) => {
    return Category_1.CategoryModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map