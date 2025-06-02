"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Area_1 = require("../../model/Area");
const remove = async (id) => {
    return await Area_1.AreaModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map