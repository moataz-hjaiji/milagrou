"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler_1 = __importDefault(require("../helpers/utils/asyncHandler"));
exports.default = (action) => (0, asyncHandler_1.default)(async (req, res, next) => {
    req.action = action;
    next();
});
//# sourceMappingURL=assignAction.js.map