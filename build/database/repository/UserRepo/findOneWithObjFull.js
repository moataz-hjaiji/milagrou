"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../../model/User");
const findOneWithObjFull = (obj) => {
    return User_1.UserModel.findOne(obj).select('+password').exec();
};
exports.default = findOneWithObjFull;
//# sourceMappingURL=findOneWithObjFull.js.map