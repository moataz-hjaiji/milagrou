"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const lodash_1 = require("lodash");
const UserRepo_1 = __importDefault(require("../../database/repository/UserRepo"));
const ApiError_1 = require("../../core/ApiError");
const KeystoreRepo_1 = __importDefault(require("../../database/repository/KeystoreRepo"));
const authUtils_1 = require("../../authUtils/authUtils");
const auth_1 = require("../../helpers/utils/auth");
const RoleRepo_1 = __importDefault(require("../../database/repository/RoleRepo"));
const loginAdmin = async ({ email, password }) => {
    const emailToLowerCase = email.toLocaleLowerCase();
    const roleUser = await RoleRepo_1.default.findByCode('user');
    if (!roleUser)
        throw new ApiError_1.NotFoundError('user role not found');
    const admin = await UserRepo_1.default.findByObjFull({
        email: emailToLowerCase,
        roles: { $nin: [roleUser.id] },
    });
    if (!admin)
        throw new ApiError_1.BadRequestError('Admin not registered');
    const match = await bcryptjs_1.default.compare(password, admin.password);
    if (!match)
        throw new ApiError_1.AuthFailureError('Invalid credentials');
    const { accessTokenKey, refreshTokenKey } = (0, auth_1.generateKeys)();
    await KeystoreRepo_1.default.create(admin.id, accessTokenKey, refreshTokenKey);
    const [tokens] = await Promise.all([
        (0, authUtils_1.createTokens)(admin, accessTokenKey, refreshTokenKey),
        admin,
    ]);
    const filteredUser = (0, lodash_1.omit)(admin.toObject(), ['password']);
    admin.lastLogin = new Date();
    await admin.save();
    return {
        tokens: tokens,
        admin: filteredUser,
    };
};
exports.loginAdmin = loginAdmin;
//# sourceMappingURL=loginAdmin.service.js.map