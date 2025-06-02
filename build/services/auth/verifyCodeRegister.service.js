"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCodeRegister = void 0;
const UserRepo_1 = __importDefault(require("../../database/repository/UserRepo"));
const ApiError_1 = require("../../core/ApiError");
const RoleRepo_1 = __importDefault(require("../../database/repository/RoleRepo"));
const verifyCodeRegister = async ({ phoneNumber, registerConfirmationCode, }) => {
    const roleUser = await RoleRepo_1.default.findByCode('user');
    if (!roleUser)
        throw new ApiError_1.NotFoundError('user role not found');
    const userCheck = await UserRepo_1.default.findByObj({
        phoneNumber,
        registerConfirmationCode,
        roles: roleUser.id,
        verified: false,
    });
    if (!userCheck)
        throw new ApiError_1.BadRequestError('invalid verification code');
};
exports.verifyCodeRegister = verifyCodeRegister;
//# sourceMappingURL=verifyCodeRegister.service.js.map