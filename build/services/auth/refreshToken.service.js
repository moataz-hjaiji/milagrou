"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const JWT_1 = __importDefault(require("../../core/JWT"));
const UserRepo_1 = __importDefault(require("../../database/repository/UserRepo"));
const ApiError_1 = require("../../core/ApiError");
const KeystoreRepo_1 = __importDefault(require("../../database/repository/KeystoreRepo"));
const authUtils_1 = require("../../authUtils/authUtils");
const refreshToken = async (req) => {
    req.accessToken = (0, authUtils_1.getAccessToken)(req.headers.authorization); // Express headers are auto converted to lowercase
    const accessTokenPayload = await JWT_1.default.decode(req.accessToken);
    (0, authUtils_1.validateTokenData)(accessTokenPayload);
    const user = await UserRepo_1.default.findById(accessTokenPayload.sub);
    if (!user)
        throw new ApiError_1.AuthFailureError('User not registered');
    req.user = user;
    const refreshTokenPayload = await JWT_1.default.validate(req.body.refreshToken);
    (0, authUtils_1.validateTokenData)(refreshTokenPayload);
    if (accessTokenPayload.sub !== refreshTokenPayload.sub)
        throw new ApiError_1.AuthFailureError('Invalid access token');
    const keystore = await KeystoreRepo_1.default.find(req.user.id, accessTokenPayload.prm, refreshTokenPayload.prm);
    if (!keystore)
        throw new ApiError_1.AuthFailureError('Invalid access token');
    await KeystoreRepo_1.default.remove(keystore.id);
    const accessTokenKey = crypto_1.default.randomBytes(64).toString('hex');
    const refreshTokenKey = crypto_1.default.randomBytes(64).toString('hex');
    await KeystoreRepo_1.default.create(req.user.id, accessTokenKey, refreshTokenKey);
    const tokens = await (0, authUtils_1.createTokens)(req.user, accessTokenKey, refreshTokenKey);
    return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
    };
};
exports.refreshToken = refreshToken;
//# sourceMappingURL=refreshToken.service.js.map