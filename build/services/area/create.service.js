"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const ApiError_1 = require("../../core/ApiError");
const AreaRepo_1 = __importDefault(require("../../database/repository/AreaRepo"));
const create = async ({ body }) => {
    const area = await AreaRepo_1.default.create(body);
    if (!area)
        throw new ApiError_1.BadRequestError('error creating area');
    return area;
};
exports.create = create;
//# sourceMappingURL=create.service.js.map