"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Store_1 = require("../../model/Store");
const update = async (id, obj) => {
    return await Store_1.StoreModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map