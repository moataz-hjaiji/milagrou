"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementOrDecrement = void 0;
const ApiError_1 = require("../../core/ApiError");
const Cart_1 = require("../../database/model/Cart");
const CartRepo_1 = __importDefault(require("../../database/repository/CartRepo"));
const incrementOrDecrement = async ({ userId, itemId, action, }) => {
    let cart = await CartRepo_1.default.findByObj({ userId });
    if (!cart)
        throw new ApiError_1.BadRequestError('item doesnt exsist in your cart');
    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex !== -1) {
        if (action === Cart_1.CartAction.PLUS)
            ++cart.items[itemIndex].quantity;
        if (action === Cart_1.CartAction.MINUS)
            --cart.items[itemIndex].quantity;
        if (cart.items[itemIndex].quantity <= 0)
            cart.items.splice(itemIndex, 1);
    }
    else {
        throw new ApiError_1.BadRequestError('item doesnt exsist in your cart');
    }
    await cart.save();
    return cart;
};
exports.incrementOrDecrement = incrementOrDecrement;
//# sourceMappingURL=incrementOrDecrement.service.js.map