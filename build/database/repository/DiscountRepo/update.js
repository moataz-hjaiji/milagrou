"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Discount_1 = require("../../model/Discount");
const update = async (id, obj) => {
    return await Discount_1.DiscountModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map