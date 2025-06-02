"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyCodeForgetPasword = exports.resendForgetPassword = exports.forgetPassword = exports.setCredentials = exports.verifyCodeRegister = exports.resendRegisterPhone = exports.registerPhone = exports.refreshToken = exports.logout = exports.loginAdmin = exports.loginUser = void 0;
const asyncHandler_1 = __importDefault(require("../helpers/utils/asyncHandler"));
const auth_1 = __importDefault(require("../services/auth"));
const ApiResponse_1 = require("../core/ApiResponse");
exports.loginUser = (0, asyncHandler_1.default)(async (req, res) => {
    const { emailOrPhone, password } = req.body;
    const result = await auth_1.default.loginUser({ emailOrPhone, password });
    new ApiResponse_1.SuccessResponse('Login Success', result).send(res);
});
exports.loginAdmin = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const result = await auth_1.default.loginAdmin({ email, password });
    new ApiResponse_1.SuccessResponse('Login Success', result).send(res);
});
exports.logout = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.keystore;
    await auth_1.default.logout(id);
    new ApiResponse_1.SuccessMsgResponse('Logout success').send(res);
});
exports.refreshToken = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await auth_1.default.refreshToken(req);
    new ApiResponse_1.TokenRefreshResponse('Token Issued', result.accessToken, result.refreshToken).send(res);
});
exports.registerPhone = (0, asyncHandler_1.default)(async (req, res) => {
    const { phoneNumber } = req.body;
    await auth_1.default.registerPhone(phoneNumber);
    new ApiResponse_1.SuccessMsgResponse('Register success').send(res);
});
exports.resendRegisterPhone = (0, asyncHandler_1.default)(async (req, res) => {
    const { phoneNumber } = req.body;
    await auth_1.default.resendRegisterPhone(phoneNumber);
    new ApiResponse_1.SuccessMsgResponse('Resend success').send(res);
});
exports.verifyCodeRegister = (0, asyncHandler_1.default)(async (req, res) => {
    const { phoneNumber, registerConfirmationCode } = req.body;
    await auth_1.default.verifyCodeRegister({
        phoneNumber,
        registerConfirmationCode,
    });
    new ApiResponse_1.SuccessMsgResponse('Verification success').send(res);
});
exports.setCredentials = (0, asyncHandler_1.default)(async (req, res) => {
    const { phoneNumber, registerConfirmationCode, password, confirmPassword, firstName, lastName, email, } = req.body;
    const result = await auth_1.default.setCredentials({
        phoneNumber,
        firstName,
        lastName,
        email,
        registerConfirmationCode,
        password,
        confirmPassword,
    });
    new ApiResponse_1.SuccessResponse('Credentials set success', result).send(res);
});
exports.forgetPassword = (0, asyncHandler_1.default)(async (req, res) => {
    const { phoneNumber } = req.body;
    await auth_1.default.forgetPassword(phoneNumber);
    new ApiResponse_1.SuccessMsgResponse('Forget password request success').send(res);
});
exports.resendForgetPassword = (0, asyncHandler_1.default)(async (req, res) => {
    const { phoneNumber } = req.body;
    await auth_1.default.resendForgetPassword(phoneNumber);
    new ApiResponse_1.SuccessMsgResponse('Resend success').send(res);
});
exports.verifyCodeForgetPasword = (0, asyncHandler_1.default)(async (req, res) => {
    const { phoneNumber, forgetConfirmationCode } = req.body;
    await auth_1.default.verifyCodeForgetPasword({
        phoneNumber,
        forgetConfirmationCode,
    });
    new ApiResponse_1.SuccessMsgResponse('Verification success').send(res);
});
exports.resetPassword = (0, asyncHandler_1.default)(async (req, res) => {
    const { phoneNumber, forgetConfirmationCode, password, confirmPassword } = req.body;
    const result = await auth_1.default.resetPassword({
        phoneNumber,
        forgetConfirmationCode,
        password,
        confirmPassword,
    });
    new ApiResponse_1.SuccessResponse('Password reset success', result).send(res);
});
//# sourceMappingURL=auth.controller.js.map