"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = exports.getAll = void 0;
const asyncHandler_1 = __importDefault(require("../helpers/utils/asyncHandler"));
const permission_1 = __importDefault(require("../services/permission"));
const ApiResponse_1 = require("../core/ApiResponse");
exports.getAll = (0, asyncHandler_1.default)(async (req, res) => {
    const { query } = req;
    const result = await permission_1.default.getAll(query);
    new ApiResponse_1.SuccessResponsePaginate('All permissions returned successfully', result.docs, result.meta).send(res);
});
exports.getOne = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { query } = req;
    const result = await permission_1.default.getOne(id, query);
    new ApiResponse_1.SuccessResponse('Permission returned', result).send(res);
});
//# sourceMappingURL=permission.controller.js.map