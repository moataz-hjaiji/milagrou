"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMe = exports.updateMe = exports.getMe = exports.remove = exports.update = exports.getOne = exports.getAll = exports.create = void 0;
const asyncHandler_1 = __importDefault(require("../helpers/utils/asyncHandler"));
const user_1 = __importDefault(require("../services/user"));
const ApiResponse_1 = require("../core/ApiResponse");
const ApiError_1 = require("../core/ApiError");
exports.create = (0, asyncHandler_1.default)(async (req, res) => {
    const { body, file } = req;
    const result = await user_1.default.create({ body, file });
    new ApiResponse_1.SuccessResponse('User created', result).send(res);
});
exports.getAll = (0, asyncHandler_1.default)(async (req, res) => {
    const { query } = req;
    const result = await user_1.default.getAll(query);
    new ApiResponse_1.SuccessResponsePaginate('All users returned successfully', result.docs, result.meta).send(res);
});
exports.getOne = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { query } = req;
    const result = await user_1.default.getOne(id, query);
    new ApiResponse_1.SuccessResponse('User returned', result).send(res);
});
exports.update = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { body, file } = req;
    const result = await user_1.default.update({ id, body, file });
    new ApiResponse_1.SuccessResponse('User updated', result).send(res);
});
exports.remove = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (id === req.user._id.toString())
        throw new ApiError_1.BadRequestError('you cant delete yourself');
    await user_1.default.remove(id);
    new ApiResponse_1.SuccessMsgResponse('User Deleted').send(res);
});
exports.getMe = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.user;
    const { query } = req;
    const result = await user_1.default.getOne(id, query);
    new ApiResponse_1.SuccessResponse('User returned', result).send(res);
});
exports.updateMe = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.user;
    const { body, file } = req;
    const result = await user_1.default.update({ id, body, file });
    new ApiResponse_1.SuccessResponse('User updated', result).send(res);
});
exports.removeMe = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.user;
    await user_1.default.remove(id);
    new ApiResponse_1.SuccessMsgResponse('User Deleted').send(res);
});
//# sourceMappingURL=user.controller.js.map