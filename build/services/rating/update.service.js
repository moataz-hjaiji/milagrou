"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const RatingRepo_1 = __importDefault(require("../../database/repository/RatingRepo"));
const ApiError_1 = require("../../core/ApiError");
const update = async ({ id, body }) => {
    const rating = await RatingRepo_1.default.update(id, body);
    if (!rating)
        throw new ApiError_1.BadRequestError('rating not found');
    return rating;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map