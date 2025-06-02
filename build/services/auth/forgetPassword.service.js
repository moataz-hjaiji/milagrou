"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgetPassword = void 0;
const UserRepo_1 = __importDefault(require("../../database/repository/UserRepo"));
const ApiError_1 = require("../../core/ApiError");
const crypto_1 = __importDefault(require("crypto"));
const smsSender_1 = require("../../helpers/utils/smsSender");
const forgetPassword = async (phoneNumber) => {
    const userCheck = await UserRepo_1.default.findByObj({ phoneNumber });
    if (!userCheck)
        throw new ApiError_1.NotFoundError('User not found');
    if (userCheck.forgetConfirmationCode)
        throw new ApiError_1.BadRequestError('verification code already sent');
    const randomCode = crypto_1.default.randomInt(100001, 999999);
    const user = await UserRepo_1.default.update(userCheck.id, {
        forgetConfirmationCode: randomCode,
    });
    if (!user)
        throw new ApiError_1.BadRequestError('error updating user');
    const message = `Your verification code is:${randomCode}`;
    const messageSettings = {
        body: message,
        to: phoneNumber,
    };
    (0, smsSender_1.sendTwilioMessage)(messageSettings);
};
exports.forgetPassword = forgetPassword;
//# sourceMappingURL=forgetPassword.service.js.map