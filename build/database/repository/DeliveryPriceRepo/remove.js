"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DeliveryPrice_1 = require("../../model/DeliveryPrice");
const remove = async (id) => {
    return await DeliveryPrice_1.DeliveryPriceModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map