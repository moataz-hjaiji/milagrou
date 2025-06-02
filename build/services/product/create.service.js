"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const ApiError_1 = require("../../core/ApiError");
const ProductRepo_1 = __importDefault(require("../../database/repository/ProductRepo"));
const create = async ({ body, files }) => {
    if (files) {
        if ('images' in files) {
            const images = files['images'];
            const imagesArray = images.map((file) => file.path);
            body.images = imagesArray;
        }
    }
    else
        throw new ApiError_1.BadRequestError('images were not provided');
    const product = await ProductRepo_1.default.create(body);
    if (!product)
        throw new ApiError_1.BadRequestError('error creating product');
    return product;
};
exports.create = create;
//# sourceMappingURL=create.service.js.map