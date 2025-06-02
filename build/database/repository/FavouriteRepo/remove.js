"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Favourite_1 = require("../../model/Favourite");
const remove = async (id) => {
    return await Favourite_1.FavouriteModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map