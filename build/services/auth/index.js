"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loginUser_service_1 = require("./loginUser.service");
const loginAdmin_service_1 = require("./loginAdmin.service");
const logout_service_1 = require("./logout.service");
const refreshToken_service_1 = require("./refreshToken.service");
const registerPhone_service_1 = require("./registerPhone.service");
const resendRegisterPhone_service_1 = require("./resendRegisterPhone.service");
const verifyCodeRegister_service_1 = require("./verifyCodeRegister.service");
const setCredentials_service_1 = require("./setCredentials.service");
const forgetPassword_service_1 = require("./forgetPassword.service");
const verifyCodeForgetPasword_service_1 = require("./verifyCodeForgetPasword.service");
const resendForgetPassword_service_1 = require("./resendForgetPassword.service");
const resetPassword_service_1 = require("./resetPassword.service");
exports.default = {
    loginUser: loginUser_service_1.loginUser,
    loginAdmin: loginAdmin_service_1.loginAdmin,
    logout: logout_service_1.logout,
    refreshToken: refreshToken_service_1.refreshToken,
    registerPhone: registerPhone_service_1.registerPhone,
    resendRegisterPhone: resendRegisterPhone_service_1.resendRegisterPhone,
    verifyCodeRegister: verifyCodeRegister_service_1.verifyCodeRegister,
    setCredentials: setCredentials_service_1.setCredentials,
    forgetPassword: forgetPassword_service_1.forgetPassword,
    verifyCodeForgetPasword: verifyCodeForgetPasword_service_1.verifyCodeForgetPasword,
    resendForgetPassword: resendForgetPassword_service_1.resendForgetPassword,
    resetPassword: resetPassword_service_1.resetPassword,
};
//# sourceMappingURL=index.js.map