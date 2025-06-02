"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PromoCode_1 = require("../../model/PromoCode");
const update = async (id, obj) => {
    return await PromoCode_1.PromoCodeModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map