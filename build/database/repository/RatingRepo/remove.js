"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Rating_1 = require("../../model/Rating");
const remove = async (id) => {
    return await Rating_1.RatingModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map