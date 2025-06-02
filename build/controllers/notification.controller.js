"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribeFromTopic = exports.subscribeToTopic = exports.markAllAsSeen = exports.update = exports.getOne = exports.getAll = void 0;
const asyncHandler_1 = __importDefault(require("../helpers/utils/asyncHandler"));
const notification_1 = __importDefault(require("../services/notification"));
const ApiResponse_1 = require("../core/ApiResponse");
exports.getAll = (0, asyncHandler_1.default)(async (req, res) => {
    const { query } = req;
    const result = await notification_1.default.getAll(query);
    new ApiResponse_1.SuccessResponsePaginate('All notifications returned successfully', result.docs, result.meta).send(res);
});
exports.getOne = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { query } = req;
    const result = await notification_1.default.getOne(id, query);
    new ApiResponse_1.SuccessResponse('Notification returned', result).send(res);
});
exports.update = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const result = await notification_1.default.update({ id, body });
    new ApiResponse_1.SuccessResponse('Notification updated', result).send(res);
});
exports.markAllAsSeen = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user._id;
    await notification_1.default.markAllAsSeen(userId);
    new ApiResponse_1.SuccessMsgResponse('Success').send(res);
});
exports.subscribeToTopic = (0, asyncHandler_1.default)(async (req, res) => {
    const { token, topic } = req.body;
    await notification_1.default.subscribeToTopic(token, topic);
    new ApiResponse_1.SuccessMsgResponse('Success').send(res);
});
exports.unsubscribeFromTopic = (0, asyncHandler_1.default)(async (req, res) => {
    const { token, topic } = req.body;
    await notification_1.default.unsubscribeFromTopic(token, topic);
    new ApiResponse_1.SuccessMsgResponse('Success').send(res);
});
//# sourceMappingURL=notification.controller.js.map