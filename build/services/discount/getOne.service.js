"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const DiscountRepo_1 = __importDefault(require("../../database/repository/DiscountRepo"));
const ApiError_1 = require("../../core/ApiError");
const getOne = async (id, query) => {
    const discount = await DiscountRepo_1.default.findById(id, query);
    if (!discount)
        throw new ApiError_1.BadRequestError('Discount not found');
    return discount;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map