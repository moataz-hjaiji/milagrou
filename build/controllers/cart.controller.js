"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editItem = exports.removeFromCart = exports.incrementOrDecrement = exports.getMyCart = exports.addToCart = void 0;
const asyncHandler_1 = __importDefault(require("../helpers/utils/asyncHandler"));
const cart_1 = __importDefault(require("../services/cart"));
const ApiResponse_1 = require("../core/ApiResponse");
exports.addToCart = (0, asyncHandler_1.default)(async (req, res) => {
    const item = req.body;
    const userId = req.user._id;
    const result = await cart_1.default.addToCart({ item, userId });
    new ApiResponse_1.SuccessResponse('success', result).send(res);
});
exports.getMyCart = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const result = await cart_1.default.getMyCart(userId);
    new ApiResponse_1.SuccessResponse('success', result).send(res);
});
exports.incrementOrDecrement = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { itemId, action } = req.body;
    const result = await cart_1.default.incrementOrDecrement({
        userId,
        itemId,
        action,
    });
    new ApiResponse_1.SuccessResponse('success', result).send(res);
});
exports.removeFromCart = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { itemId } = req.body;
    const result = await cart_1.default.removeFromCart({
        userId,
        itemId,
    });
    new ApiResponse_1.SuccessResponse('success', result).send(res);
});
exports.editItem = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { itemId, item } = req.body;
    const result = await cart_1.default.editItem({
        userId,
        itemId,
        item,
    });
    new ApiResponse_1.SuccessResponse('success', result).send(res);
});
//# sourceMappingURL=cart.controller.js.map