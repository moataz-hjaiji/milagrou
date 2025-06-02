"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = void 0;
const ProductRepo_1 = __importDefault(require("../../database/repository/ProductRepo"));
const getMaxDiscount_1 = require("../discount/getMaxDiscount");
const checkFavourite_1 = require("../favourite/checkFavourite");
const getAll = async (query) => {
    const { page, perPage, userId } = query;
    delete query.userId;
    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(perPage, 10) || 10,
        populate: 'category',
    };
    let products = await ProductRepo_1.default.findAll(options, query);
    await Promise.all(products.docs.map(async (product) => {
        if (userId) {
            product.isFavourite = await (0, checkFavourite_1.checkFavourite)(userId, product._id.toString());
        }
        const priceAfterDiscount = await (0, getMaxDiscount_1.getMaxDiscountedPrice)(product);
        product.priceAfterDiscount = priceAfterDiscount;
    }));
    const { docs, ...meta } = products;
    return {
        meta,
        docs,
    };
};
exports.getAll = getAll;
//# sourceMappingURL=getAll.service.js.map