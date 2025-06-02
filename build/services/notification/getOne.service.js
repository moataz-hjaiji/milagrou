"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const NotificationRepo_1 = __importDefault(require("../../database/repository/NotificationRepo"));
const ApiError_1 = require("../../core/ApiError");
const getOne = async (id, query) => {
    const notification = await NotificationRepo_1.default.findById(id, query);
    if (!notification)
        throw new ApiError_1.BadRequestError('Notification not found');
    return notification;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map