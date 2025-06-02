"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCodeForgetPasword = void 0;
const UserRepo_1 = __importDefault(require("../../database/repository/UserRepo"));
const ApiError_1 = require("../../core/ApiError");
const verifyCodeForgetPasword = async ({ phoneNumber, forgetConfirmationCode, }) => {
    const userCheck = await UserRepo_1.default.findByObj({
        phoneNumber,
        forgetConfirmationCode,
    });
    if (!userCheck)
        throw new ApiError_1.BadRequestError('invalid verification code');
};
exports.verifyCodeForgetPasword = verifyCodeForgetPasword;
//# sourceMappingURL=verifyCodeForgetPasword.service.js.map