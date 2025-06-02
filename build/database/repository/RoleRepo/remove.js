"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Role_1 = require("../../model/Role");
const remove = async (id) => {
    return await Role_1.RoleModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map