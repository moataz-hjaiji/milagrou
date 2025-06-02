"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyCart = void 0;
const CartRepo_1 = __importDefault(require("../../database/repository/CartRepo"));
const calculateCartPrices_1 = require("./calculateCartPrices");
const getMyCart = async (userId) => {
    let cart;
    let totalCartPrice = 0;
    const cartCheck = await CartRepo_1.default.findByObj({ userId });
    if (!cartCheck) {
        cart = await CartRepo_1.default.create({ userId });
    }
    else {
        cart = cartCheck;
    }
    await cart.populate([
        {
            path: 'items.product.category', // Nested population for product->category
        },
        {
            path: 'items.supplements', // Separate population for supplements
        },
    ]);
    // await cart.populate([
    //   {
    //     path: 'items.product',
    //     populate: [
    //       { path: 'productPrice', select: ' -createdAt -updatedAt' },
    //       {
    //         path: 'supplementArray.supplementCategory',
    //         select: '-description -createdAt -updatedAt',
    //       },
    //       {
    //         path: 'supplementArray.supplements.supplement',
    //         select: '-description -createdAt -updatedAt',
    //       },
    //       {
    //         path: 'subCategory',
    //         populate: [
    //           {
    //             path: 'category',
    //             populate: [
    //               { path: 'menu', select: '-description -createdAt -updatedAt' },
    //             ],
    //             select: '-description -createdAt -updatedAt',
    //           },
    //         ],
    //         select: '-description -createdAt -updatedAt',
    //       },
    //       {
    //         path: 'category',
    //         populate: [
    //           { path: 'menu', select: '-description -createdAt -updatedAt' },
    //         ],
    //         select: '-description -createdAt -updatedAt',
    //       },
    //     ],
    //     select: '-createdAt -updatedAt',
    //   },
    //   {
    //     path: 'items.selectedSupplements',
    //     populate: [
    //       {
    //         path: 'supplementCategory',
    //         select: '-description -createdAt -updatedAt',
    //       },
    //       {
    //         path: 'supplements.supplement',
    //         select: '-description -createdAt -updatedAt',
    //       },
    //     ],
    //   },
    // ]);
    let result = await (0, calculateCartPrices_1.calculateItemPrices)(cart.toObject());
    result.items.map((item) => {
        totalCartPrice += item.itemPrice.totalPrice;
    });
    result.totalCartPrice = totalCartPrice;
    return result;
};
exports.getMyCart = getMyCart;
//# sourceMappingURL=getMyCart.service.js.map