"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const ApiError_1 = require("../../core/ApiError");
const CategoryRepo_1 = __importDefault(require("../../database/repository/CategoryRepo"));
const create = async ({ body }) => {
    const category = await CategoryRepo_1.default.create(body);
    if (!category)
        throw new ApiError_1.BadRequestError('error creating category');
    return category;
};
exports.create = create;
//# sourceMappingURL=create.service.js.map