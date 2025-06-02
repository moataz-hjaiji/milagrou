"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editItem = void 0;
const ApiError_1 = require("../../core/ApiError");
const CartRepo_1 = __importDefault(require("../../database/repository/CartRepo"));
const editItem = async ({ userId, itemId, item }) => {
    let cart = await CartRepo_1.default.findByObj({ userId });
    if (!cart)
        throw new ApiError_1.BadRequestError('item doesnt exsist in your cart');
    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex !== -1) {
        cart.items[itemIndex] = { ...cart.items[itemIndex].toObject(), ...item };
    }
    else {
        throw new ApiError_1.BadRequestError('item doesnt exsist in your cart');
    }
    await cart.save();
    return cart;
};
exports.editItem = editItem;
//# sourceMappingURL=editItem.service.js.map