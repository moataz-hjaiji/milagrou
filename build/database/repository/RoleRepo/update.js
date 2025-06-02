"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Role_1 = require("../../model/Role");
const update = async (id, obj) => {
    return await Role_1.RoleModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map