"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const RoleRepo_1 = __importDefault(require("../../database/repository/RoleRepo"));
const ApiError_1 = require("../../core/ApiError");
const update = async ({ id, body }) => {
    if (body.name) {
        const checkRoleName = await RoleRepo_1.default.findByObj({ name: body.name });
        if (checkRoleName)
            throw new ApiError_1.BadRequestError('role with that name already exists');
    }
    const checkUntouchableRoles = await RoleRepo_1.default.findById(id);
    if (checkUntouchableRoles &&
        ['user', 'admin', 'delivery'].includes(checkUntouchableRoles.name)) {
        throw new ApiError_1.BadRequestError('role name invalid: you cant change standard role names (admin, user, delivery)');
    }
    const role = await RoleRepo_1.default.update(id, body);
    if (!role)
        throw new ApiError_1.BadRequestError('role not found');
    return role;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map