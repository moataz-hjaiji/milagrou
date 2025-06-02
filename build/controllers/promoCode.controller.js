"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPromoCode = exports.remove = exports.update = exports.getOne = exports.getAll = exports.create = void 0;
const asyncHandler_1 = __importDefault(require("../helpers/utils/asyncHandler"));
const promoCode_1 = __importDefault(require("../services/promoCode"));
const ApiResponse_1 = require("../core/ApiResponse");
exports.create = (0, asyncHandler_1.default)(async (req, res) => {
    const { body } = req;
    const result = await promoCode_1.default.create({ body });
    new ApiResponse_1.SuccessResponse('PromoCode created', result).send(res);
});
exports.getAll = (0, asyncHandler_1.default)(async (req, res) => {
    const { query } = req;
    const result = await promoCode_1.default.getAll(query);
    new ApiResponse_1.SuccessResponsePaginate('All promoCodes returned successfully', result.docs, result.meta).send(res);
});
exports.getOne = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { query } = req;
    const result = await promoCode_1.default.getOne(id, query);
    new ApiResponse_1.SuccessResponse('PromoCode returned', result).send(res);
});
exports.update = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const result = await promoCode_1.default.update({ id, body });
    new ApiResponse_1.SuccessResponse('PromoCode updated', result).send(res);
});
exports.remove = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    await promoCode_1.default.remove(id);
    new ApiResponse_1.SuccessMsgResponse('PromoCode Deleted').send(res);
});
exports.verifyPromoCode = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { code } = req.body;
    const result = await promoCode_1.default.verifyPromoCode({ userId, code });
    new ApiResponse_1.SuccessResponse('success', result).send(res);
});
//# sourceMappingURL=promoCode.controller.js.map