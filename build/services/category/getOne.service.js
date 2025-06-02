"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const CategoryRepo_1 = __importDefault(require("../../database/repository/CategoryRepo"));
const ApiError_1 = require("../../core/ApiError");
const getOne = async (id, query) => {
    const category = await CategoryRepo_1.default.findById(id, query);
    if (!category)
        throw new ApiError_1.BadRequestError('Category not found');
    return category;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map