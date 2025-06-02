"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggle = void 0;
const ApiError_1 = require("../../core/ApiError");
const FavouriteRepo_1 = __importDefault(require("../../database/repository/FavouriteRepo"));
const ProductRepo_1 = __importDefault(require("../../database/repository/ProductRepo"));
const toggle = async ({ userId, productId }) => {
    const product = await ProductRepo_1.default.findById(productId);
    if (!product)
        throw new ApiError_1.BadRequestError('product not found');
    const favourite = await FavouriteRepo_1.default.findByObj({
        userId,
        product: productId,
    });
    if (!favourite) {
        await FavouriteRepo_1.default.create({ userId, product: productId });
        return true;
    }
    else {
        await FavouriteRepo_1.default.remove(favourite._id);
        return false;
    }
};
exports.toggle = toggle;
//# sourceMappingURL=toggle.service.js.map