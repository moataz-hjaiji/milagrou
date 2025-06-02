"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Category_1 = require("../../model/Category");
const findAll = (obj) => {
    return Category_1.CategoryModel.find(obj).exec();
};
exports.default = findAll;
//# sourceMappingURL=findAllNotPaginated.js.map