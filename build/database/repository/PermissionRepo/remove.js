"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Permission_1 = require("../../model/Permission");
const remove = async (id) => {
    return await Permission_1.PermissionModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map