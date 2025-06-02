"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Role_1 = require("../../model/Role");
const findByCode = (code) => {
    return Role_1.RoleModel.findOne({ name: code }).exec();
};
exports.default = findByCode;
//# sourceMappingURL=findByCode.js.map