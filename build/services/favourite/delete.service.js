"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const FavouriteRepo_1 = __importDefault(require("../../database/repository/FavouriteRepo"));
const ApiError_1 = require("../../core/ApiError");
const remove = async (id) => {
    const favourite = await FavouriteRepo_1.default.remove(id);
    if (!favourite)
        throw new ApiError_1.BadRequestError('Favourite not found');
};
exports.remove = remove;
//# sourceMappingURL=delete.service.js.map