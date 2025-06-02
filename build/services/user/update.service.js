"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const UserRepo_1 = __importDefault(require("../../database/repository/UserRepo"));
const ApiError_1 = require("../../core/ApiError");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const update = async ({ id, body, file }) => {
    if (file)
        body.avatar = file.path;
    if (body.password)
        body.password = await bcryptjs_1.default.hash(body.password, 12);
    const user = await UserRepo_1.default.update(id, body);
    if (!user)
        throw new ApiError_1.BadRequestError('user not found');
    return user;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map