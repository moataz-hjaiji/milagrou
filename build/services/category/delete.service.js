"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const CategoryRepo_1 = __importDefault(require("../../database/repository/CategoryRepo"));
const ApiError_1 = require("../../core/ApiError");
const remove = async (id) => {
    const category = await CategoryRepo_1.default.remove(id);
    if (!category)
        throw new ApiError_1.BadRequestError('Category not found');
};
exports.remove = remove;
//# sourceMappingURL=delete.service.js.map