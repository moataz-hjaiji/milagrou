"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Discount_1 = require("../../model/Discount");
const remove = async (id) => {
    return await Discount_1.DiscountModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map