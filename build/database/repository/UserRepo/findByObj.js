"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../../model/User");
const findByObj = (obj) => {
    return User_1.UserModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map