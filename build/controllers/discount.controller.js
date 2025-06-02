"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.getOne = exports.getAll = exports.create = void 0;
const asyncHandler_1 = __importDefault(require("../helpers/utils/asyncHandler"));
const discount_1 = __importDefault(require("../services/discount"));
const ApiResponse_1 = require("../core/ApiResponse");
exports.create = (0, asyncHandler_1.default)(async (req, res) => {
    const { body } = req;
    const result = await discount_1.default.create({ body });
    new ApiResponse_1.SuccessResponse('Discount created', result).send(res);
});
exports.getAll = (0, asyncHandler_1.default)(async (req, res) => {
    const { query } = req;
    const result = await discount_1.default.getAll(query);
    new ApiResponse_1.SuccessResponsePaginate('All discounts returned successfully', result.docs, result.meta).send(res);
});
exports.getOne = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { query } = req;
    const result = await discount_1.default.getOne(id, query);
    new ApiResponse_1.SuccessResponse('Discount returned', result).send(res);
});
exports.update = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const result = await discount_1.default.update({ id, body });
    new ApiResponse_1.SuccessResponse('Discount updated', result).send(res);
});
exports.remove = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    await discount_1.default.remove(id);
    new ApiResponse_1.SuccessMsgResponse('Discount Deleted').send(res);
});
//# sourceMappingURL=discount.controller.js.map