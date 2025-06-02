"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Category_1 = require("../../model/Category");
const create = async (obj) => {
    return await Category_1.CategoryModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map