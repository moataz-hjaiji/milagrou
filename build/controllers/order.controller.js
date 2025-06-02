"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.remove = exports.update = exports.getOne = exports.getAll = exports.checkout = void 0;
const asyncHandler_1 = __importDefault(require("../helpers/utils/asyncHandler"));
const order_1 = __importDefault(require("../services/order"));
const ApiResponse_1 = require("../core/ApiResponse");
exports.checkout = (0, asyncHandler_1.default)(async (req, res) => {
    const { deliveryType, paymentMethodId, addressId, code } = req.body;
    const userId = req.user._id;
    const result = await order_1.default.checkout({
        userId,
        deliveryType,
        paymentMethodId,
        addressId,
        code,
    });
    new ApiResponse_1.SuccessResponse('success', result).send(res);
});
exports.getAll = (0, asyncHandler_1.default)(async (req, res) => {
    const { query } = req;
    const result = await order_1.default.getAll(query);
    new ApiResponse_1.SuccessResponsePaginate('All orders returned successfully', result.docs, result.meta).send(res);
});
exports.getOne = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { query } = req;
    const result = await order_1.default.getOne(id, query);
    new ApiResponse_1.SuccessResponse('Order returned', result).send(res);
});
exports.update = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const result = await order_1.default.update({ id, body });
    new ApiResponse_1.SuccessResponse('Order updated', result).send(res);
});
exports.remove = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    await order_1.default.remove(id);
    new ApiResponse_1.SuccessMsgResponse('Order Deleted').send(res);
});
exports.cancelOrder = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const result = await order_1.default.cancelOrder(id, userId);
    new ApiResponse_1.SuccessResponse('Order canceled', result).send(res);
});
//# sourceMappingURL=order.controller.js.map