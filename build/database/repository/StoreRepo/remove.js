"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Store_1 = require("../../model/Store");
const remove = async (id) => {
    return await Store_1.StoreModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map