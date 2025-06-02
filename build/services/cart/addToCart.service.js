"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToCart = void 0;
const CartRepo_1 = __importDefault(require("../../database/repository/CartRepo"));
const addToCart = async ({ userId, item }) => {
    let cart;
    const cartCheck = await CartRepo_1.default.findByObj({ userId });
    if (!cartCheck) {
        cart = await CartRepo_1.default.create({ userId });
    }
    else {
        cart = cartCheck;
    }
    cart.items.push(item);
    await cart.save();
    return cart;
};
exports.addToCart = addToCart;
//# sourceMappingURL=addToCart.service.js.map