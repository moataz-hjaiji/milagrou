"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const UserRepo_1 = __importDefault(require("../../database/repository/UserRepo"));
const ApiError_1 = require("../../core/ApiError");
const remove = async (id) => {
    const user = await UserRepo_1.default.remove(id);
    if (!user)
        throw new ApiError_1.BadRequestError('User not found');
};
exports.remove = remove;
//# sourceMappingURL=delete.service.js.map