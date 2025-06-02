"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Favourite_1 = require("../../model/Favourite");
const findByObj = (obj) => {
    return Favourite_1.FavouriteModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map