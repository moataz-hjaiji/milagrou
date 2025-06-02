"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const RatingRepo_1 = __importDefault(require("../../database/repository/RatingRepo"));
const ApiError_1 = require("../../core/ApiError");
const getOne = async (id, query) => {
    const rating = await RatingRepo_1.default.findById(id, query);
    if (!rating)
        throw new ApiError_1.BadRequestError('Rating not found');
    return rating;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map