"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const RatingRepo_1 = __importDefault(require("../../database/repository/RatingRepo"));
const ApiError_1 = require("../../core/ApiError");
const remove = async (id) => {
    const rating = await RatingRepo_1.default.remove(id);
    if (!rating)
        throw new ApiError_1.BadRequestError('rating not found');
};
exports.remove = remove;
//# sourceMappingURL=delete.service.js.map