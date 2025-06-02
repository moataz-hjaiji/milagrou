"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DeliveryPrice_1 = require("../../model/DeliveryPrice");
const update = async (id, obj) => {
    return await DeliveryPrice_1.DeliveryPriceModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map