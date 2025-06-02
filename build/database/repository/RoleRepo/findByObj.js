"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Role_1 = require("../../model/Role");
const findByObj = (obj) => {
    return Role_1.RoleModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map