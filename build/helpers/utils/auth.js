"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKeys = void 0;
const crypto_1 = __importDefault(require("crypto"));
const KEY_SIZE = 64;
const generateKeys = () => ({
    accessTokenKey: crypto_1.default.randomBytes(KEY_SIZE).toString('hex'),
    refreshTokenKey: crypto_1.default.randomBytes(KEY_SIZE).toString('hex'),
});
exports.generateKeys = generateKeys;
//# sourceMappingURL=auth.js.map