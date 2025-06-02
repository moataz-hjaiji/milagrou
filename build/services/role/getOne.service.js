"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const RoleRepo_1 = __importDefault(require("../../database/repository/RoleRepo"));
const ApiError_1 = require("../../core/ApiError");
const getOne = async (id, query) => {
    const role = await RoleRepo_1.default.findById(id, query);
    if (!role)
        throw new ApiError_1.BadRequestError('Role not found');
    return role;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map