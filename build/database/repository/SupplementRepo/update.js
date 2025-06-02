"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Supplement_1 = require("../../model/Supplement");
const update = async (id, obj) => {
    return await Supplement_1.SupplementModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map