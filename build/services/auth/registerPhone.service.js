"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPhone = void 0;
const UserRepo_1 = __importDefault(require("../../database/repository/UserRepo"));
const ApiError_1 = require("../../core/ApiError");
const RoleRepo_1 = __importDefault(require("../../database/repository/RoleRepo"));
const crypto_1 = __importDefault(require("crypto"));
const smsSender_1 = require("../../helpers/utils/smsSender");
const registerPhone = async (phoneNumber) => {
    const userCheck = await UserRepo_1.default.findByObj({ phoneNumber });
    if (userCheck && userCheck.verified) {
        throw new ApiError_1.BadRequestError('User with that phone number aleardy exists');
    }
    else if (userCheck && !userCheck.verified) {
        throw new ApiError_1.BadRequestError('Unverified User with that phone number aleardy exists');
    }
    const roleUser = await RoleRepo_1.default.findByCode('user');
    if (!roleUser)
        throw new ApiError_1.NotFoundError('user role not found');
    const randomCode = crypto_1.default.randomInt(100001, 999999);
    const user = await UserRepo_1.default.create({
        roles: [roleUser.id],
        phoneNumber,
        registerConfirmationCode: randomCode,
    });
    if (!user)
        throw new ApiError_1.BadRequestError('error creating user');
    const message = `Your verification code is:${randomCode}`;
    const messageSettings = {
        body: message,
        to: phoneNumber,
    };
    (0, smsSender_1.sendTwilioMessage)(messageSettings);
};
exports.registerPhone = registerPhone;
//# sourceMappingURL=registerPhone.service.js.map