"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = void 0;
const KeystoreRepo_1 = __importDefault(require("../../database/repository/KeystoreRepo"));
const logout = async (keystoreId) => {
    await KeystoreRepo_1.default.remove(keystoreId);
};
exports.logout = logout;
//# sourceMappingURL=logout.service.js.map