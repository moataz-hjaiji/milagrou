"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../../model/User");
const aggregate = async (obj) => {
    return await User_1.UserModel.aggregate(obj);
};
exports.default = aggregate;
//# sourceMappingURL=aggregate.js.map