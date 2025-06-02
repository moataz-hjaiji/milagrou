"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const FavouriteRepo_1 = __importDefault(require("../../database/repository/FavouriteRepo"));
const ApiError_1 = require("../../core/ApiError");
const update = async ({ id, body }) => {
    const favourite = await FavouriteRepo_1.default.update(id, body);
    if (!favourite)
        throw new ApiError_1.BadRequestError('favourite not found');
    return favourite;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map