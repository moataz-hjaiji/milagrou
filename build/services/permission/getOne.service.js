"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const PermissionRepo_1 = __importDefault(require("../../database/repository/PermissionRepo"));
const ApiError_1 = require("../../core/ApiError");
const getOne = async (id, query) => {
    const permission = await PermissionRepo_1.default.findById(id, query);
    if (!permission)
        throw new ApiError_1.BadRequestError('Permission not found');
    return permission;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map