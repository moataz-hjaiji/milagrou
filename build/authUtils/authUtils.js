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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokens = exports.validateTokenData = exports.getAccessToken = void 0;
const ApiError_1 = require("../core/ApiError");
const JWT_1 = __importStar(require("../core/JWT"));
const mongoose_1 = require("mongoose");
const configVars_1 = require("../configVars");
const getAccessToken = (authorization) => {
    if (!authorization)
        throw new ApiError_1.AuthFailureError('Invalid Authorization');
    if (!authorization.startsWith('Bearer '))
        throw new ApiError_1.AuthFailureError('Invalid Authorization');
    return authorization.split(' ')[1];
};
exports.getAccessToken = getAccessToken;
const validateTokenData = (payload) => {
    if (!payload ||
        !payload.iss ||
        !payload.sub ||
        !payload.aud ||
        !payload.prm ||
        payload.iss !== configVars_1.tokenInfo.issuer ||
        payload.aud !== configVars_1.tokenInfo.audience ||
        !mongoose_1.Types.ObjectId.isValid(payload.sub) ||
        !mongoose_1.Types.ObjectId.isValid(payload.sub))
        throw new ApiError_1.AuthFailureError('Invalid Access Token');
    return true;
};
exports.validateTokenData = validateTokenData;
const createTokens = async (user, accessTokenKey, refreshTokenKey) => {
    const accessToken = await JWT_1.default.encode(new JWT_1.JwtPayload(configVars_1.tokenInfo.issuer, configVars_1.tokenInfo.audience, user.id, accessTokenKey, configVars_1.tokenInfo.accessTokenValidityDays));
    if (!accessToken)
        throw new ApiError_1.InternalError();
    const refreshToken = await JWT_1.default.encode(new JWT_1.JwtPayload(configVars_1.tokenInfo.issuer, configVars_1.tokenInfo.audience, user.id, refreshTokenKey, configVars_1.tokenInfo.refreshTokenValidityDays));
    if (!refreshToken)
        throw new ApiError_1.InternalError();
    return {
        accessToken: accessToken,
        refreshToken: refreshToken,
    };
};
exports.createTokens = createTokens;
//# sourceMappingURL=authUtils.js.map