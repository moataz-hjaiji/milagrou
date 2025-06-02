"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Permission_1 = require("../../model/Permission");
const update = async (id, obj) => {
    return await Permission_1.PermissionModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map