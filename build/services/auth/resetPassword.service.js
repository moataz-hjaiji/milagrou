"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = void 0;
const UserRepo_1 = __importDefault(require("../../database/repository/UserRepo"));
const ApiError_1 = require("../../core/ApiError");
const auth_1 = require("../../helpers/utils/auth");
const KeystoreRepo_1 = __importDefault(require("../../database/repository/KeystoreRepo"));
const authUtils_1 = require("../../authUtils/authUtils");
const lodash_1 = require("lodash");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const resetPassword = async ({ phoneNumber, forgetConfirmationCode, password, confirmPassword, }) => {
    const userCheck = await UserRepo_1.default.findByObj({
        phoneNumber,
        forgetConfirmationCode,
    });
    if (!userCheck)
        throw new ApiError_1.BadRequestError('invalid verification code');
    if (password !== confirmPassword)
        throw new ApiError_1.BadRequestError('password and confirm password do not match');
    const setUser = await UserRepo_1.default.update(userCheck.id, {
        forgetConfirmationCode: null,
        password: await bcryptjs_1.default.hash(password, 12),
    });
    if (!setUser)
        throw new ApiError_1.BadRequestError('error setting user password');
    const { accessTokenKey, refreshTokenKey } = (0, auth_1.generateKeys)();
    await KeystoreRepo_1.default.create(setUser.id, accessTokenKey, refreshTokenKey);
    const [tokens] = await Promise.all([
        (0, authUtils_1.createTokens)(setUser, accessTokenKey, refreshTokenKey),
        setUser,
    ]);
    const filteredUser = (0, lodash_1.omit)(setUser.toObject(), ['password']);
    return {
        tokens: tokens,
        user: filteredUser,
    };
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=resetPassword.service.js.map