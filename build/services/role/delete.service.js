"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const RoleRepo_1 = __importDefault(require("../../database/repository/RoleRepo"));
const ApiError_1 = require("../../core/ApiError");
const remove = async (id) => {
    const checkUntouchableRoles = await RoleRepo_1.default.findById(id);
    if (checkUntouchableRoles &&
        ['user', 'admin', 'delivery'].includes(checkUntouchableRoles.name)) {
        throw new ApiError_1.BadRequestError('role name invalid: you cant change standard role names (admin, user, delivery)');
    }
    const role = await RoleRepo_1.default.remove(id);
    if (!role)
        throw new ApiError_1.BadRequestError('Role not found');
};
exports.remove = remove;
//# sourceMappingURL=delete.service.js.map