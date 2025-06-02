"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const ApiError_1 = require("../../core/ApiError");
const RoleRepo_1 = __importDefault(require("../../database/repository/RoleRepo"));
const create = async ({ body }) => {
    const checkRoleName = await RoleRepo_1.default.findByObj({ name: body.name });
    if (checkRoleName)
        throw new ApiError_1.BadRequestError('role with that name already exists');
    const role = await RoleRepo_1.default.create(body);
    if (!role)
        throw new ApiError_1.BadRequestError('error creating role');
    return role;
};
exports.create = create;
//# sourceMappingURL=create.service.js.map