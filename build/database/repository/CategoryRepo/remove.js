"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Category_1 = require("../../model/Category");
const remove = async (id) => {
    return await Category_1.CategoryModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map