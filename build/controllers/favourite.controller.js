"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggle = exports.remove = exports.update = exports.getOne = exports.getAll = exports.create = void 0;
const asyncHandler_1 = __importDefault(require("../helpers/utils/asyncHandler"));
const favourite_1 = __importDefault(require("../services/favourite"));
const ApiResponse_1 = require("../core/ApiResponse");
exports.create = (0, asyncHandler_1.default)(async (req, res) => {
    const { body } = req;
    const result = await favourite_1.default.create({ body });
    new ApiResponse_1.SuccessResponse('Favourite created', result).send(res);
});
exports.getAll = (0, asyncHandler_1.default)(async (req, res) => {
    const { query } = req;
    const result = await favourite_1.default.getAll(query);
    new ApiResponse_1.SuccessResponsePaginate('All favourites returned successfully', result.docs, result.meta).send(res);
});
exports.getOne = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { query } = req;
    const result = await favourite_1.default.getOne(id, query);
    new ApiResponse_1.SuccessResponse('Favourite returned', result).send(res);
});
exports.update = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const result = await favourite_1.default.update({ id, body });
    new ApiResponse_1.SuccessResponse('Favourite updated', result).send(res);
});
exports.remove = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    await favourite_1.default.remove(id);
    new ApiResponse_1.SuccessMsgResponse('Favourite Deleted').send(res);
});
exports.toggle = (0, asyncHandler_1.default)(async (req, res) => {
    const productId = req.params.id;
    const userId = req.user._id;
    const result = await favourite_1.default.toggle({ productId, userId });
    if (result === true) {
        new ApiResponse_1.SuccessMsgResponse('product added to favourites').send(res);
    }
    else {
        new ApiResponse_1.SuccessMsgResponse('product removed from favourites').send(res);
    }
});
//# sourceMappingURL=favourite.controller.js.map