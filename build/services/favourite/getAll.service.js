"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = void 0;
const FavouriteRepo_1 = __importDefault(require("../../database/repository/FavouriteRepo"));
const getMaxDiscount_1 = require("../discount/getMaxDiscount");
const getAll = async (query) => {
    const { page, perPage } = query;
    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(perPage, 10) || 10,
        populate: 'product.category',
    };
    const favourites = await FavouriteRepo_1.default.findAll(options, query);
    await Promise.all(favourites.docs.map(async (favourite) => {
        const priceAfterDiscount = await (0, getMaxDiscount_1.getMaxDiscountedPrice)(favourite.product);
        favourite.product.priceAfterDiscount = priceAfterDiscount;
    }));
    const { docs, ...meta } = favourites;
    return {
        meta,
        docs,
    };
};
exports.getAll = getAll;
//# sourceMappingURL=getAll.service.js.map