"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../../model/User");
const findAllNotPaginated = (obj) => {
    return User_1.UserModel.find(obj).exec();
};
exports.default = findAllNotPaginated;
//# sourceMappingURL=findAllNotPaginated.js.map