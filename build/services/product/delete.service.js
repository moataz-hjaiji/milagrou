"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const ProductRepo_1 = __importDefault(require("../../database/repository/ProductRepo"));
const ApiError_1 = require("../../core/ApiError");
const remove = async (id) => {
    const product = await ProductRepo_1.default.remove(id);
    if (!product)
        throw new ApiError_1.BadRequestError('Product not found');
};
exports.remove = remove;
//# sourceMappingURL=delete.service.js.map