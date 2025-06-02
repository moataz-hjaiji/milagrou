"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Role_1 = require("../../model/Role");
const create = async (obj) => {
    return await Role_1.RoleModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map