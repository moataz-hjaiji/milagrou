"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const ProductRepo_1 = __importDefault(require("../../database/repository/ProductRepo"));
const ApiError_1 = require("../../core/ApiError");
const update = async ({ id, body, files }) => {
    if (files) {
        if ('images' in files) {
            const images = files['images'];
            const imagesArray = images.map((file) => file.path);
            body.images = imagesArray;
        }
    }
    const product = await ProductRepo_1.default.update(id, body);
    if (!product)
        throw new ApiError_1.BadRequestError('product not found');
    return product;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map