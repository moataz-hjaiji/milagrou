"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Supplement_1 = require("../../model/Supplement");
const remove = async (id) => {
    return await Supplement_1.SupplementModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map