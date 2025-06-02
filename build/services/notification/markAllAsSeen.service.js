"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsSeen = void 0;
const NotificationRepo_1 = __importDefault(require("../../database/repository/NotificationRepo"));
const markAllAsSeen = async (userId) => {
    await NotificationRepo_1.default.updateMany({ userId }, { isSeen: true });
};
exports.markAllAsSeen = markAllAsSeen;
//# sourceMappingURL=markAllAsSeen.service.js.map