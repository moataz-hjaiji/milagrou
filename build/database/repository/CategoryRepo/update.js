"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Category_1 = require("../../model/Category");
const update = async (id, obj) => {
    return await Category_1.CategoryModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map