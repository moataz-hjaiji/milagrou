"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../../model/User");
const update = async (id, obj) => {
    return await User_1.UserModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map