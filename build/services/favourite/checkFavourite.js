"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFavourite = void 0;
const FavouriteRepo_1 = __importDefault(require("../../database/repository/FavouriteRepo"));
async function checkFavourite(userId, product) {
    const favourite = await FavouriteRepo_1.default.findByObj({
        userId,
        product,
    });
    return !!favourite;
}
exports.checkFavourite = checkFavourite;
//# sourceMappingURL=checkFavourite.js.map