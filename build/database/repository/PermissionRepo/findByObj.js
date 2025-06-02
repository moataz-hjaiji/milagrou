"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Permission_1 = require("../../model/Permission");
const findByObj = (obj) => {
    return Permission_1.PermissionModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map