"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const DiscountRepo_1 = __importDefault(require("../../database/repository/DiscountRepo"));
const ApiError_1 = require("../../core/ApiError");
const remove = async (id) => {
    const discount = await DiscountRepo_1.default.remove(id);
    if (!discount)
        throw new ApiError_1.BadRequestError('Discount not found');
};
exports.remove = remove;
//# sourceMappingURL=delete.service.js.map