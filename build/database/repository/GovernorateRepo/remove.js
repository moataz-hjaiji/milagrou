"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Governorate_1 = require("../../model/Governorate");
const remove = async (id) => {
    return await Governorate_1.GovernorateModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map