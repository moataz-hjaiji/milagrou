"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../../model/User");
const create = async (obj) => {
    return await User_1.UserModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map