"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Favourite_1 = require("../../model/Favourite");
const update = async (id, obj) => {
    return await Favourite_1.FavouriteModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map