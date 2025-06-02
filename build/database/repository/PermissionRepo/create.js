"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Permission_1 = require("../../model/Permission");
const create = async (obj) => {
    return await Permission_1.PermissionModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map