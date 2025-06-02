"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("@hapi/joi"));
exports.default = {
    loginAdmin: joi_1.default.object().keys({
        email: joi_1.default.string().required(),
        password: joi_1.default.string().required(),
    }),
    loginUser: joi_1.default.object().keys({
        emailOrPhone: joi_1.default.string().required(),
        password: joi_1.default.string().required().required(),
    }),
    refreshToken: joi_1.default.object().keys({
        refreshToken: joi_1.default.string().required().min(1),
    }),
    registerPhone: joi_1.default.object().keys({
        phoneNumber: joi_1.default.string().required(),
    }),
    forgetPhone: joi_1.default.object().keys({
        phoneNumber: joi_1.default.string().required(),
    }),
    verifyRegisterPhone: joi_1.default.object().keys({
        phoneNumber: joi_1.default.string().required(),
        registerConfirmationCode: joi_1.default.number().required(),
    }),
    verifyForgetPassword: joi_1.default.object().keys({
        phoneNumber: joi_1.default.string().required(),
        forgetConfirmationCode: joi_1.default.number().required(),
    }),
    setCredentials: joi_1.default.object().keys({
        phoneNumber: joi_1.default.string().required(),
        registerConfirmationCode: joi_1.default.number(),
        firstName: joi_1.default.string().min(3).required(),
        lastName: joi_1.default.string().min(3).required(),
        email: joi_1.default.string().min(3).required(),
        password: joi_1.default.string().min(8).required(),
        confirmPassword: joi_1.default.string().min(8).required(),
    }),
    setPassword: joi_1.default.object().keys({
        phoneNumber: joi_1.default.string().required(),
        forgetConfirmationCode: joi_1.default.number().required(),
        password: joi_1.default.string().min(8).required(),
        confirmPassword: joi_1.default.string().min(8).required(),
    }),
};
//# sourceMappingURL=schema.js.map