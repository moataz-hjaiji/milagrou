"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const CategoryRepo_1 = __importDefault(require("../../database/repository/CategoryRepo"));
const ApiError_1 = require("../../core/ApiError");
const update = async ({ id, body }) => {
    const category = await CategoryRepo_1.default.update(id, body);
    if (!category)
        throw new ApiError_1.BadRequestError('category not found');
    return category;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map