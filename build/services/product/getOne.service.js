"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const ProductRepo_1 = __importDefault(require("../../database/repository/ProductRepo"));
const ApiError_1 = require("../../core/ApiError");
const getMaxDiscount_1 = require("../discount/getMaxDiscount");
const getOne = async (id, query) => {
    let product = await ProductRepo_1.default.findById(id, query);
    if (!product)
        throw new ApiError_1.BadRequestError('Product not found');
    await product.populate('category');
    const productObject = product.toObject();
    const priceAfterDiscount = await (0, getMaxDiscount_1.getMaxDiscountedPrice)(productObject);
    productObject.priceAfterDiscount = priceAfterDiscount;
    return product;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map