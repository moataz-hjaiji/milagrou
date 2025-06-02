"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validator_1 = __importDefault(require("../../helpers/utils/validator"));
const schema_1 = __importDefault(require("./schema"));
const authentication_1 = __importDefault(require("../../authUtils/authentication"));
const authController = __importStar(require("../../controllers/auth.controller"));
const router = express_1.default.Router();
router.post('/login/user', (0, validator_1.default)(schema_1.default.loginUser), authController.loginUser);
router.post('/login/admin', (0, validator_1.default)(schema_1.default.loginAdmin), authController.loginAdmin);
router.post('/register', (0, validator_1.default)(schema_1.default.registerPhone), authController.registerPhone);
router.post('/register/verify', (0, validator_1.default)(schema_1.default.verifyRegisterPhone), authController.verifyCodeRegister);
router.post('/register/set-credentials', (0, validator_1.default)(schema_1.default.setCredentials), authController.setCredentials);
router.post('/register/resend', (0, validator_1.default)(schema_1.default.registerPhone), authController.resendRegisterPhone);
router.post('/password/forget', (0, validator_1.default)(schema_1.default.forgetPhone), authController.forgetPassword);
router.post('/password/verify', (0, validator_1.default)(schema_1.default.verifyForgetPassword), authController.verifyCodeForgetPasword);
router.post('/password/reset', (0, validator_1.default)(schema_1.default.setPassword), authController.resetPassword);
router.post('/password/resend', (0, validator_1.default)(schema_1.default.forgetPhone), authController.resendForgetPassword);
router.use('/', authentication_1.default);
router.post('/refresh', (0, validator_1.default)(schema_1.default.refreshToken), authController.refreshToken);
router.post('/logout', authController.logout);
exports.default = router;
//# sourceMappingURL=router.js.map