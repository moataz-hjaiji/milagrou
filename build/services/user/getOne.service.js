"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const UserRepo_1 = __importDefault(require("../../database/repository/UserRepo"));
const ApiError_1 = require("../../core/ApiError");
const getOne = async (id, query) => {
    const user = await UserRepo_1.default.findById(id, query);
    if (!user)
        throw new ApiError_1.BadRequestError('User not found');
    return user;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map