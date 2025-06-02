"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const FavouriteRepo_1 = __importDefault(require("../../database/repository/FavouriteRepo"));
const ApiError_1 = require("../../core/ApiError");
const getMaxDiscount_1 = require("../discount/getMaxDiscount");
const getOne = async (id, query) => {
    let favourite = await FavouriteRepo_1.default.findById(id, query);
    if (!favourite)
        throw new ApiError_1.BadRequestError('Favourite not found');
    await favourite.populate('product.category');
    const favouriteObject = favourite.toObject();
    const priceAfterDiscount = await (0, getMaxDiscount_1.getMaxDiscountedPrice)(favouriteObject.product);
    favouriteObject.product.priceAfterDiscount = priceAfterDiscount;
    return favourite;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map