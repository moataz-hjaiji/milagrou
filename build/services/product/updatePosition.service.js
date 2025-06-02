"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePosition = void 0;
const ProductRepo_1 = __importDefault(require("../../database/repository/ProductRepo"));
const ApiError_1 = require("../../core/ApiError");
const updatePosition = async (body) => {
    const product = await ProductRepo_1.default.bulkWrite(body.updates);
    if (!product)
        throw new ApiError_1.BadRequestError('product not found');
};
exports.updatePosition = updatePosition;
//# sourceMappingURL=updatePosition.service.js.map