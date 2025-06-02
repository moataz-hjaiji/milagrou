"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Favourite_1 = require("../../model/Favourite");
const create = async (obj) => {
    return await Favourite_1.FavouriteModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map