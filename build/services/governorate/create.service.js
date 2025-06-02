"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const ApiError_1 = require("../../core/ApiError");
const GovernorateRepo_1 = __importDefault(require("../../database/repository/GovernorateRepo"));
const create = async ({ body }) => {
    const governorate = await GovernorateRepo_1.default.create(body);
    if (!governorate)
        throw new ApiError_1.BadRequestError('error creating governorate');
    return governorate;
};
exports.create = create;
//# sourceMappingURL=create.service.js.map