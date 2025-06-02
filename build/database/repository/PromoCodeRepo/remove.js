"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PromoCode_1 = require("../../model/PromoCode");
const remove = async (id) => {
    return await PromoCode_1.PromoCodeModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map